import axios from 'axios';

import { store } from '@app/store';
import { withStorefrontUnauthorizedClear } from '@features/account/storefrontRequest';
import type { StoreAreaRecord, StoreCityRecord } from '@features/account/types';
import { getEnvConfig } from '@shared/config/env';
import {
  storefrontCheckoutUrl,
  storefrontStoreUrl,
} from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

const TIMEOUT_MS = 20000;

const isSuccessEnvelope = (data: Record<string, unknown>): boolean =>
  data.success === true ||
  data.success === 1 ||
  data.success === '1' ||
  data.success === 'true';

const mapCities = (data: Record<string, unknown>): StoreCityRecord[] => {
  const list = Array.isArray(data.data) ? data.data : [];
  return list
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
};

const mapAreas = (data: Record<string, unknown>): StoreAreaRecord[] => {
  const list = Array.isArray(data.data) ? data.data : [];
  return list
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
};

export const fetchStoreCities = async (): Promise<StoreCityRecord[]> =>
  withStorefrontUnauthorizedClear('storefront_cities_401', async () => {
    const countryId = getEnvConfig(store.getState().app.country).storefrontCitiesCountryId;
    const url = storefrontStoreUrl(`cities/${encodeURIComponent(countryId)}`);
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: await buildStorefrontAuthHeaders(),
    });
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    if (!isSuccessEnvelope(data)) return [];
    return mapCities(data);
  });

export const fetchStoreAreas = async (cityId: number): Promise<StoreAreaRecord[]> =>
  withStorefrontUnauthorizedClear('storefront_areas_401', async () => {
    const url = storefrontStoreUrl(
      `city/areas/${encodeURIComponent(String(cityId))}`,
    );
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: await buildStorefrontAuthHeaders(),
    });
    const data =
      response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>)
        : {};
    if (!isSuccessEnvelope(data)) return [];
    return mapAreas(data);
  });

export type SaveAddressPayload = {
  mobile: string;
  firstname: string;
  lastname: string;
  address: string;
  state_province_id: string | number;
  city_area_id: string | number;
};

export const saveCustomerAddress = async (
  payload: SaveAddressPayload,
): Promise<{ success: boolean; message?: string }> =>
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
