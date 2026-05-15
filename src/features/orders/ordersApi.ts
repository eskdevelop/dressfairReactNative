import axios from 'axios';

import { store } from '@app/store';
import { clearStoredUserSession } from '@features/auth/authSync';
import { getEnvConfig } from '@shared/config/env';
import { storefrontCheckoutUrl } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';
import { analytics } from '@shared/observability/analytics';

import type {
  Order,
  OrderCustomer,
  OrderHistoryResponse,
  OrderProduct,
  OrderProductImage,
} from './types';

const REQUEST_TIMEOUT_MS = 15000;

/** Flutter `AppUrl.orderHistoryApi`: GET `/api/rest/store/checkout/orders` + Bearer JWT. */
const buildOrdersUrl = (): string => storefrontCheckoutUrl('orders');

const resolveImageUrl = (raw: unknown): string => {
  if (typeof raw !== 'string' || raw.length === 0) return '';
  if (raw.startsWith('https://') || raw.startsWith('http://')) return raw;
  const country = store.getState().app.country;
  const { apiHost } = getEnvConfig(country);
  // OpenCart serves catalogue product images out of `/image/<relativePath>`
  // off the same host that exposes the REST plugin. The API returns
  // `productimages/foo.jpg`, which we prefix to a fully-qualified URL.
  const trimmed = raw.replace(/^\/+/, '');
  return `${apiHost}/image/${trimmed}`;
};

const asString = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const mapImage = (raw: unknown): OrderProductImage | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const url = resolveImageUrl(r.url);
  if (url.length === 0) return null;
  const id =
    typeof r.id === 'number' && Number.isFinite(r.id) ? r.id : undefined;
  return { id, url };
};

const mapProduct = (raw: unknown): OrderProduct | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const productName = asString(r.product_name).trim();
  if (productName.length === 0) return null;
  const productSku = asString(r.product_sku ?? r.sku).trim();
  const quantity = asNumber(r.order_product_quantity ?? r.quantity, 1);
  const options =
    r.options && typeof r.options === 'object'
      ? (r.options as Record<string, unknown>)
      : null;
  const optionLabel = options ? asString(options.label).trim() : '';
  const rawImages = Array.isArray(r.images) ? r.images : [];
  const images = rawImages
    .map(mapImage)
    .filter((image): image is OrderProductImage => image !== null);
  return {
    productSku,
    productName,
    quantity,
    optionLabel: optionLabel.length > 0 ? optionLabel : undefined,
    images,
  };
};

const mapOrder = (raw: unknown): Order | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const orderId = asNumber(r.order_id, NaN);
  if (!Number.isFinite(orderId)) return null;
  const currency =
    r.currency && typeof r.currency === 'object'
      ? (r.currency as Record<string, unknown>)
      : null;
  const currencyCode = currency ? asString(currency.code).trim() : '';
  const rawProducts = Array.isArray(r.order_products) ? r.order_products : [];
  const products = rawProducts
    .map(mapProduct)
    .filter((product): product is OrderProduct => product !== null);
  return {
    orderId,
    orderTotalAmount: asString(r.order_total_amount),
    currencyCode,
    orderStatus: asString(r.order_status).trim(),
    products,
  };
};

const mapCustomer = (raw: unknown): OrderCustomer | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    customerName: asString(r.customer_name).trim() || undefined,
    customerMobile: asString(r.customer_mobile).trim() || undefined,
    customerCountry: asString(r.customer_country).trim() || undefined,
    customerCity: asString(r.customer_city).trim() || undefined,
    customerArea: asString(r.customer_area).trim() || undefined,
  };
};

export type FetchOrdersOptions = {
  signal?: AbortSignal;
};

export const fetchOrderHistory = async (
  options?: FetchOrdersOptions,
): Promise<OrderHistoryResponse> => {
  const url = buildOrdersUrl();
  const headers = await buildStorefrontAuthHeaders();
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      signal: options?.signal,
      headers,
    });
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    const success =
      data.success === true ||
      data.success === 1 ||
      data.success === '1' ||
      data.success === 'true';
    const ordersRaw = Array.isArray(data.orders) ? data.orders : [];
    const orders = ordersRaw
      .map(mapOrder)
      .filter((order): order is Order => order !== null);
    return {
      success,
      message: typeof data.message === 'string' ? data.message : undefined,
      customer: mapCustomer(data.customer),
      orders,
    };
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      ((error.response?.status ?? 0) === 401)
    ) {
      analytics.track('customer_token_rejected_clearing_native_session');
      await clearStoredUserSession();
    }
    throw error;
  }
};
