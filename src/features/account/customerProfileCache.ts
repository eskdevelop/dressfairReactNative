import AsyncStorage from '@react-native-async-storage/async-storage';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';

import type { CustomerAddressRecord, CustomerProfile } from './types';

const VERSION = 'v1';

const ALL_COUNTRIES: CountryCode[] = ['UAE', 'OMN', 'KSA'];

export function customerProfileStorageKey(country?: CountryCode): string {
  const c = country ?? store.getState().app.country;
  return `@dressfair/customer_profile_${VERSION}_${c}`;
}

const asNum = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

const parseAddress = (raw: unknown): CustomerAddressRecord | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = asNum(r.id);
  if (id <= 0) return null;
  return {
    id,
    customerId: asNum(r.customerId ?? r.customer_id),
    address: typeof r.address === 'string' ? r.address : '',
    cityId: asNum(r.cityId ?? r.city_id),
    cityAreaId: asNum(r.cityAreaId ?? r.city_area_id),
    isDefault: asNum(r.isDefault ?? r.is_default),
    cityName: typeof r.cityName === 'string' ? r.cityName : undefined,
    areaName: typeof r.areaName === 'string' ? r.areaName : undefined,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
  };
};

/** Minimal validation so corrupted AsyncStorage rows never poison UI. */
export function parseCachedCustomerProfile(raw: unknown): CustomerProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = asNum(o.id);
  if (id <= 0) return null;
  const addressesRaw = Array.isArray(o.addresses) ? o.addresses : [];
  const addresses = addressesRaw
    .map(parseAddress)
    .filter((a): a is CustomerAddressRecord => a !== null);

  const creditBalanceLabel =
    typeof o.creditBalanceLabel === 'string' ? o.creditBalanceLabel : undefined;
  const couponsOffersLabel =
    typeof o.couponsOffersLabel === 'string' ? o.couponsOffersLabel : undefined;

  return {
    id,
    firstname: typeof o.firstname === 'string' ? o.firstname : '',
    lastname: typeof o.lastname === 'string' ? o.lastname : '',
    mobile: typeof o.mobile === 'string' ? o.mobile : '',
    email: typeof o.email === 'string' ? o.email : '',
    image: typeof o.image === 'string' ? o.image : '',
    addresses,
    creditBalanceLabel,
    couponsOffersLabel,
  };
}

export async function loadCachedProfile(
  country?: CountryCode,
): Promise<CustomerProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(customerProfileStorageKey(country));
    if (!raw) return null;
    const decoded = JSON.parse(raw) as unknown;
    return parseCachedCustomerProfile(decoded);
  } catch {
    return null;
  }
}

export async function saveCachedProfile(
  country: CountryCode | undefined,
  profile: CustomerProfile,
): Promise<void> {
  const key = customerProfileStorageKey(country);
  await AsyncStorage.setItem(key, JSON.stringify(profile));
}

/** Clears cached profile for one region, or all regions if `country` is omitted. */
export async function clearCachedProfile(country?: CountryCode): Promise<void> {
  if (country !== undefined) {
    await AsyncStorage.removeItem(customerProfileStorageKey(country));
    return;
  }
  await Promise.all(
    ALL_COUNTRIES.map(c => AsyncStorage.removeItem(customerProfileStorageKey(c))),
  );
}
