import axios from 'axios';

import { store } from '@app/store';
import { withStorefrontUnauthorizedClear } from '@features/account/storefrontRequest';
import type { StoreAreaRecord, StoreCityRecord } from '@features/account/types';
import { getEnvConfig } from '@shared/config/env';
import {
  storefrontCheckoutUrl,
  storefrontJsonApiOriginsToTry,
} from '@shared/config/storefrontUrls';
import {
  buildStorefrontAuthHeaders,
  buildStorefrontStorePublicHeaders,
} from '@shared/network/storefrontAuthHeaders';

const TIMEOUT_MS = 20000;

const trimOrigin = (s: string): string => s.replace(/\/+$/, '');

const isSuccessEnvelope = (data: Record<string, unknown>): boolean =>
  data.success === true ||
  data.success === 1 ||
  data.success === '1' ||
  data.success === 'true';

const asRecord = (raw: unknown): Record<string, unknown> | null =>
  raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null;

/** OC list payloads sometimes wrap rows in alternate keys. */
const extractRowArray = (data: Record<string, unknown>): unknown[] | null => {
  const keys = ['data', 'result', 'items', 'zones', 'cities', 'areas'] as const;
  for (const k of keys) {
    const v = data[k];
    if (Array.isArray(v)) return v;
  }
  return null;
};

const parseStoreListResponse = (raw: unknown): { rows: unknown[]; success: boolean } | null => {
  if (Array.isArray(raw)) return { rows: raw, success: true };
  const data = asRecord(raw);
  if (!data) return null;
  const rows = extractRowArray(data);
  if (rows) return { rows, success: isSuccessEnvelope(data) };
  return null;
};

const mapCityRows = (rows: unknown[]): StoreCityRecord[] =>
  rows
    .map((row): StoreCityRecord | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = Number(r.id);
      if (!Number.isFinite(id) || id <= 0) return null;
      return {
        id,
        countryId: Number(r.country_id ?? 0) || 0,
        name: typeof r.name === 'string' ? r.name : '',
        nameAr: typeof r.name_ar === 'string' ? r.name_ar : '',
      };
    })
    .filter((c): c is StoreCityRecord => c !== null);

const mapAreaRows = (rows: unknown[]): StoreAreaRecord[] =>
  rows
    .map((row): StoreAreaRecord | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = Number(r.id);
      if (!Number.isFinite(id) || id <= 0) return null;
      return {
        id,
        cityId: Number(r.city_id ?? 0) || 0,
        name: typeof r.name === 'string' ? r.name : '',
        nameAr: typeof r.name_ar === 'string' ? r.name_ar : '',
      };
    })
    .filter((a): a is StoreAreaRecord => a !== null);

const parseCitiesResponse = (
  raw: unknown,
): { cities: StoreCityRecord[]; accept: boolean } => {
  const parsed = parseStoreListResponse(raw);
  if (!parsed) return { cities: [], accept: false };
  const cities = mapCityRows(parsed.rows);
  if (cities.length > 0) return { cities, accept: true };
  if (parsed.success) return { cities: [], accept: true };
  return { cities: [], accept: false };
};

const parseAreasResponse = (
  raw: unknown,
): { areas: StoreAreaRecord[]; accept: boolean } => {
  const parsed = parseStoreListResponse(raw);
  if (!parsed) return { areas: [], accept: false };
  const areas = mapAreaRows(parsed.rows);
  if (areas.length > 0) return { areas, accept: true };
  if (parsed.success) return { areas: [], accept: true };
  return { areas: [], accept: false };
};

export const fetchStoreCities = async (): Promise<StoreCityRecord[]> => {
  const country = store.getState().app.country;
  const fromSettings = store.getState().app.storeOpenCartCountryId?.trim();
  const countryId =
    fromSettings && fromSettings.length > 0
      ? fromSettings
      : getEnvConfig(country).storefrontCitiesCountryId;
  const origins = storefrontJsonApiOriginsToTry(country);
  const path = `cities/${encodeURIComponent(countryId)}`;

  let lastError: unknown;

  for (const origin of origins) {
    const url = `${trimOrigin(origin)}/api/rest/store/${path}`;
    const attempts: readonly { headers: Record<string, string> }[] = [
      { headers: buildStorefrontStorePublicHeaders() },
      { headers: await buildStorefrontAuthHeaders() },
    ];

    for (const { headers } of attempts) {
      try {
        const response = await axios.get(url, { timeout: TIMEOUT_MS, headers });
        const { cities, accept } = parseCitiesResponse(response.data);
        if (accept) return cities;
      } catch (e) {
        lastError = e;
      }
    }
  }

  if (lastError) throw lastError;
  return [];
};

export const fetchStoreAreas = async (cityId: number): Promise<StoreAreaRecord[]> => {
  const country = store.getState().app.country;
  const origins = storefrontJsonApiOriginsToTry(country);
  const path = `city/areas/${encodeURIComponent(String(cityId))}`;

  let lastError: unknown;

  for (const origin of origins) {
    const url = `${trimOrigin(origin)}/api/rest/store/${path}`;
    const headers = await buildStorefrontAuthHeaders();
    try {
      const response = await axios.get(url, { timeout: TIMEOUT_MS, headers });
      const { areas, accept } = parseAreasResponse(response.data);
      if (accept) return areas;
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError) throw lastError;
  return [];
};

export type SaveAddressPayload = {
  mobile: string;
  firstname: string;
  lastname: string;
  address: string;
  state_province_id: string | number;
  city_area_id: string | number;
};

const parseCustomerAddressIdFromSaveResponse = (
  data: Record<string, unknown>,
): number | undefined => {
  const asNum = (v: unknown): number | undefined => {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return undefined;
  };
  const from =
    asNum(data.customer_address_id) ??
    asNum(data.customerAddressId) ??
    asNum(data.id);
  if (from !== undefined) return from;
  const nested = data.data;
  if (!nested || typeof nested !== 'object') return undefined;
  const d = nested as Record<string, unknown>;
  return (
    asNum(d.customer_address_id) ??
    asNum(d.customerAddressId) ??
    asNum(d.id) ??
    asNum(d.customer_address_entity_id)
  );
};

export const saveCustomerAddress = async (
  payload: SaveAddressPayload,
): Promise<{
  success: boolean;
  message?: string;
  customerAddressId?: number;
}> =>
  withStorefrontUnauthorizedClear('storefront_address_save_401', async () => {
    const headers = await buildStorefrontAuthHeaders();
    const response = await axios.post(
      storefrontCheckoutUrl('add/customer/address'),
      payload,
      { timeout: TIMEOUT_MS, headers },
    );
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    return {
      success: isSuccessEnvelope(data),
      message: typeof data.message === 'string' ? data.message : undefined,
      customerAddressId: parseCustomerAddressIdFromSaveResponse(data),
    };
  });

export type UpdateAddressPayload = {
  customer_address_id: string | number;
  address: string;
  state_province_id: string | number;
  city_area_id: string | number;
};

export const updateCustomerAddress = async (
  payload: UpdateAddressPayload,
): Promise<{ success: boolean; message?: string }> =>
  withStorefrontUnauthorizedClear('storefront_address_update_401', async () => {
    const headers = await buildStorefrontAuthHeaders();
    const response = await axios.put(
      storefrontCheckoutUrl('update/customer/address'),
      payload,
      { timeout: TIMEOUT_MS, headers },
    );
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    return {
      success: isSuccessEnvelope(data),
      message: typeof data.message === 'string' ? data.message : undefined,
    };
  });

export const setDefaultCustomerAddress = async (
  customerAddressId: number,
): Promise<{ success: boolean; message?: string }> =>
  withStorefrontUnauthorizedClear('storefront_address_default_401', async () => {
    const headers = await buildStorefrontAuthHeaders();
    const response = await axios.put(
      storefrontCheckoutUrl('customer/address/set-default'),
      { customer_address_id: String(customerAddressId), is_default: 1 },
      { timeout: TIMEOUT_MS, headers },
    );
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    return {
      success: isSuccessEnvelope(data),
      message: typeof data.message === 'string' ? data.message : undefined,
    };
  });

export const deleteCustomerAddress = async (
  customerAddressId: number,
): Promise<{ success: boolean; message?: string }> =>
  withStorefrontUnauthorizedClear('storefront_address_delete_401', async () => {
    const headers = await buildStorefrontAuthHeaders();
    const response = await axios.delete(
      storefrontCheckoutUrl('customer/address/delete'),
      {
        timeout: TIMEOUT_MS,
        headers,
        data: { customer_address_id: String(customerAddressId) },
      },
    );
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    return {
      success: isSuccessEnvelope(data),
      message: typeof data.message === 'string' ? data.message : undefined,
    };
  });
