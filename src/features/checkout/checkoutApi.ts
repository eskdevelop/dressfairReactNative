import axios from 'axios';

import { withStorefrontUnauthorizedClear } from '@features/account/storefrontRequest';
import {
  getStorefrontCheckoutApiOrigin,
  storefrontCheckoutUrl,
  storefrontJsonApiOriginsToTry,
} from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

import type {
  CheckoutPaymentMethod,
  OrderSuccessDetail,
  PlaceOrderBody,
  PlaceOrderResult,
} from './types';

const TIMEOUT_MS = 30000;

const isSuccessEnvelope = (data: Record<string, unknown>): boolean =>
  data.success === true ||
  data.success === 1 ||
  data.success === '1' ||
  data.success === 'true';

const asRecord = (raw: unknown): Record<string, unknown> | null =>
  raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null;

function paymentMethodsUrls(): string[] {
  const origins = storefrontJsonApiOriginsToTry();
  const paths = ['/api/rest/payment-methods', '/api/rest/store/payment-methods'];
  const urls: string[] = [];
  for (const origin of origins) {
    const base = origin.replace(/\/+$/, '');
    for (const path of paths) {
      const url = `${base}${path}`;
      if (!urls.includes(url)) urls.push(url);
    }
  }
  return urls;
}

function extractPaymentMethodRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const data = asRecord(raw);
  if (!data) return [];
  const keys = ['data', 'payment_methods', 'paymentMethods', 'result', 'methods'] as const;
  for (const key of keys) {
    const v = data[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function parsePaymentMethodRow(row: unknown): CheckoutPaymentMethod | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const id = Number(r.id ?? r.payment_method_id ?? r.paymentMethodId);
  const name = String(r.name ?? r.title ?? r.payment_method ?? r.paymentMethod ?? '').trim();
  if (!Number.isFinite(id) || id <= 0 || !name) return null;
  return {
    id,
    name,
    className:
      typeof r.class_name === 'string'
        ? r.class_name
        : typeof r.className === 'string'
          ? r.className
          : undefined,
    logo: typeof r.logo === 'string' ? r.logo : undefined,
  };
}

function parsePaymentMethods(raw: unknown): CheckoutPaymentMethod[] {
  return extractPaymentMethodRows(raw)
    .map(parsePaymentMethodRow)
    .filter((m): m is CheckoutPaymentMethod => m !== null);
}

export async function fetchPaymentMethods(): Promise<{
  ok: boolean;
  methods: CheckoutPaymentMethod[];
  message?: string;
}> {
  return withStorefrontUnauthorizedClear('checkout_payment_methods_401', async () => {
    const headers = await buildStorefrontAuthHeaders();
    let lastMessage = 'Failed to load payment methods';

    for (const url of paymentMethodsUrls()) {
      try {
        const response = await axios.get(url, {
          timeout: TIMEOUT_MS,
          headers,
          validateStatus: status => typeof status === 'number' && status < 600,
        });

        const data = asRecord(response.data);
        const methods = parsePaymentMethods(response.data);

        if (methods.length > 0) {
          return { ok: true, methods };
        }

        if (data && isSuccessEnvelope(data)) {
          return { ok: true, methods: [] };
        }

        if (typeof data?.message === 'string' && data.message.trim()) {
          lastMessage = data.message.trim();
        } else if (response.status >= 400) {
          lastMessage = `Payment methods request failed (${response.status})`;
        }
      } catch (e) {
        lastMessage = e instanceof Error ? e.message : lastMessage;
      }
    }

    return { ok: false, methods: [], message: lastMessage };
  });
}

function parsePlaceOrderResponse(raw: unknown): PlaceOrderResult {
  const data = asRecord(raw);
  if (!data) return { ok: false, message: 'Invalid response' };
  if (!isSuccessEnvelope(data)) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : typeof data.error === 'string'
          ? data.error
          : data.errors != null
            ? String(data.errors)
            : 'Failed to place order';
    return { ok: false, message };
  }
  const inner = asRecord(data.data);
  const orderId =
    data.order_id != null
      ? String(data.order_id)
      : inner?.order_id != null
        ? String(inner.order_id)
        : '';
  if (!orderId) return { ok: false, message: 'Order placed but no order id returned' };

  // Card / online payment methods return a hosted payment URL (Stripe Checkout)
  // that the user must complete; COD omits it and the order is final.
  const checkoutUrlRaw = data.checkout_url ?? inner?.checkout_url;
  const sessionIdRaw = data.session_id ?? inner?.session_id;
  const checkoutUrl =
    typeof checkoutUrlRaw === 'string' && checkoutUrlRaw.trim() ? checkoutUrlRaw.trim() : undefined;
  const sessionId =
    typeof sessionIdRaw === 'string' && sessionIdRaw.trim() ? sessionIdRaw.trim() : undefined;

  return { ok: true, orderId, checkoutUrl, sessionId };
}

export async function placeOrder(body: PlaceOrderBody): Promise<PlaceOrderResult> {
  return withStorefrontUnauthorizedClear('checkout_place_order_401', async () => {
    try {
      const headers = await buildStorefrontAuthHeaders();
      const response = await axios.post(storefrontCheckoutUrl('place/order'), body, {
        timeout: TIMEOUT_MS,
        headers,
      });
      return parsePlaceOrderResponse(response.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to place order';
      return { ok: false, message };
    }
  });
}

function parseOrderSuccessDetail(raw: unknown): OrderSuccessDetail | null {
  const envelope = asRecord(raw);
  if (!envelope || !isSuccessEnvelope(envelope)) return null;
  const data = asRecord(envelope.data) ?? envelope;
  if (!data) return null;

  const productsRaw = Array.isArray(data.order_products) ? data.order_products : [];
  const products = productsRaw
    .map((row): OrderSuccessDetail['products'][number] | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      return {
        quantity: Number(r.order_product_quantity) || 0,
        name: typeof r.product_name === 'string' ? r.product_name : '',
        sku: typeof r.product_sku === 'string' ? r.product_sku : '',
      };
    })
    .filter((p): p is OrderSuccessDetail['products'][number] => p !== null);

  return {
    customerName: typeof data.customer_name === 'string' ? data.customer_name : '',
    customerMobile: typeof data.customer_mobile === 'string' ? data.customer_mobile : '',
    customerCountry: typeof data.customer_country === 'string' ? data.customer_country : '',
    customerCity: typeof data.customer_city === 'string' ? data.customer_city : '',
    customerArea: typeof data.customer_area === 'string' ? data.customer_area : '',
    orderTotalAmount:
      typeof data.order_total_amount === 'string' || typeof data.order_total_amount === 'number'
        ? String(data.order_total_amount)
        : '',
    currencyCode: typeof data.currency_code === 'string' ? data.currency_code : '',
    products,
  };
}

export async function fetchOrderById(orderId: string): Promise<{
  ok: boolean;
  order?: OrderSuccessDetail;
  message?: string;
}> {
  return withStorefrontUnauthorizedClear('checkout_order_detail_401', async () => {
    try {
      const headers = await buildStorefrontAuthHeaders();
      const response = await axios.get(
        storefrontCheckoutUrl(`order/${encodeURIComponent(orderId)}`),
        { timeout: TIMEOUT_MS, headers },
      );
      const order = parseOrderSuccessDetail(response.data);
      if (!order) {
        return {
          ok: false,
          message:
            typeof asRecord(response.data)?.message === 'string'
              ? String(asRecord(response.data)!.message)
              : 'Failed to load order',
        };
      }
      return { ok: true, order };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load order';
      return { ok: false, message };
    }
  });
}

/** @internal test helper */
export function parsePaymentMethodsForTest(raw: unknown): CheckoutPaymentMethod[] {
  return parsePaymentMethods(raw);
}

/** @internal test helper */
export function paymentMethodsUrlCandidatesForTest(): string[] {
  return paymentMethodsUrls();
}

/** @internal test helper — primary origin used by checkout APIs */
export function primaryCheckoutApiOriginForTest(): string {
  return getStorefrontCheckoutApiOrigin();
}
