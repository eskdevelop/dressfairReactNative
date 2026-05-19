import type {
  CustomerAddressRecord,
  CustomerProfile,
  CustomerProfileApiResult,
} from './types';

const asNonEmptyStr = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : '';

const asNum = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

/**
 * Storefront address rows vary by endpoint: `is_default`, `default`, booleans, or strings.
 * `asNum(true)` is 0 in JS — without this, the UI never shows a selected default.
 */
export function normalizeAddressIsDefault(raw: unknown): number {
  if (raw === true) return 1;
  if (raw === false || raw === null || raw === undefined) return 0;
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    if (s === '1' || s === 'true' || s === 'yes') return 1;
    const n = Number(s);
    if (Number.isFinite(n) && n === 1) return 1;
    return 0;
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw === 1) return 1;
  return 0;
}

/**
 * Many OC/mobile payloads put the default flag only on the customer root as
 * `default_address_id` (per-row `is_default` missing or stale).
 */
function parseProfileDefaultAddressId(data: Record<string, unknown>): number {
  const raw =
    data.default_address_id ??
    data.defaultAddressId;
  let n = asNum(raw);
  if (n > 0) return n;

  const nested = data.default_address;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const o = nested as Record<string, unknown>;
    n =
      asNum(o.id) ||
      asNum(o.customer_address_id) ||
      asNum(o.address_id);
    if (n > 0) return n;
  }
  return 0;
}

function sortAddressesDefaultFirst(addresses: CustomerAddressRecord[]): void {
  addresses.sort((a, b) => {
    if (a.isDefault === 1 && b.isDefault !== 1) return -1;
    if (a.isDefault !== 1 && b.isDefault === 1) return 1;
    return 0;
  });
}

const mapAddress = (raw: unknown): CustomerAddressRecord | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const city =
    r.city && typeof r.city === 'object' ? (r.city as Record<string, unknown>) : null;
  const area =
    r.area && typeof r.area === 'object' ? (r.area as Record<string, unknown>) : null;
  const id = asNum(r.id) || asNum(r.customer_address_id) || asNum(r.address_id);
  if (id <= 0) return null;
  return {
    id,
    customerId: asNum(r.customer_id),
    address: asNonEmptyStr(r.address),
    cityId: asNum(r.city_id),
    cityAreaId: asNum(r.city_area_id),
    isDefault: normalizeAddressIsDefault(
      r.is_default ?? r.default ?? r.isDefault,
    ),
    cityName: city ? asNonEmptyStr(city.name) : undefined,
    areaName: area ? asNonEmptyStr(area.name) : undefined,
    createdAt: typeof r.created_at === 'string' ? r.created_at : undefined,
    updatedAt: typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
};

/** Parse GET /checkout/customer/info style envelope (unit-tested). */
export const parseCustomerProfileResponse = (
  body: Record<string, unknown>,
): CustomerProfileApiResult => {
  const ok =
    body.success === true ||
    body.success === 1 ||
    body.success === '1' ||
    body.success === 'true';
  if (!ok) {
    return {
      ok: false,
      message: typeof body.message === 'string' ? body.message : undefined,
    };
  }
  const data =
    body.data && typeof body.data === 'object'
      ? (body.data as Record<string, unknown>)
      : body;
  const id = asNum(data.id);
  if (id <= 0) {
    return { ok: false, message: 'Invalid profile data' };
  }
  const rawAddresses = Array.isArray(data.addresses) ? data.addresses : [];
  let addresses = rawAddresses
    .map(mapAddress)
    .filter((a): a is CustomerAddressRecord => a !== null);

  const profileDefaultId = parseProfileDefaultAddressId(data);
  if (profileDefaultId > 0) {
    addresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === profileDefaultId ? 1 : 0,
    }));
  }

  sortAddressesDefaultFirst(addresses);

  const creditRaw =
    data.wallet_balance ?? data.credit_balance ?? data.store_credit;
  const couponsRaw = data.coupons_count ?? data.coupon_balance;

  return {
    ok: true,
    profile: {
      id,
      firstname: asNonEmptyStr(data.firstname),
      lastname: asNonEmptyStr(data.lastname),
      mobile: asNonEmptyStr(data.mobile),
      email: asNonEmptyStr(data.email),
      image: asNonEmptyStr(data.image),
      addresses,
      creditBalanceLabel:
        creditRaw !== undefined && creditRaw !== null
          ? String(creditRaw)
          : undefined,
      couponsOffersLabel:
        couponsRaw !== undefined && couponsRaw !== null
          ? String(couponsRaw)
          : undefined,
    },
  };
};

/** Full avatar URL from relative `customer.image`. */
export const customerAvatarUri = (
  profile: Pick<CustomerProfile, 'image'>,
  cdnBase: string,
): string | undefined => {
  const img = profile.image.trim();
  if (img.length === 0) return undefined;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const base = cdnBase.replace(/\/+$/, '');
  const path = img.replace(/^\/+/, '');
  return `${base}/${path}`;
};

/**
 * Letter shown when there is no image URL — Flutter parity:
 * firstname → lastname → first [a-zA-Z] in email.
 */
export const customerAvatarFallbackLetter = (
  profile: Pick<CustomerProfile, 'firstname' | 'lastname' | 'email'> | null,
): string => {
  if (!profile) return '?';
  const fn = profile.firstname?.trim();
  if (fn?.length) return fn[0].toUpperCase();
  const ln = profile.lastname?.trim();
  if (ln?.length) return ln[0].toUpperCase();
  const em = profile.email?.trim();
  if (em?.length) {
    const letter = em.match(/[a-zA-Z]/);
    if (letter) return letter[0].toUpperCase();
  }
  return '?';
};
