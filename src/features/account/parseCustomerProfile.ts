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

const mapAddress = (raw: unknown): CustomerAddressRecord | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const city =
    r.city && typeof r.city === 'object' ? (r.city as Record<string, unknown>) : null;
  const area =
    r.area && typeof r.area === 'object' ? (r.area as Record<string, unknown>) : null;
  const id = asNum(r.id);
  if (id <= 0) return null;
  return {
    id,
    customerId: asNum(r.customer_id),
    address: asNonEmptyStr(r.address),
    cityId: asNum(r.city_id),
    cityAreaId: asNum(r.city_area_id),
    isDefault: asNum(r.is_default),
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
  const addresses = rawAddresses
    .map(mapAddress)
    .filter((a): a is CustomerAddressRecord => a !== null);

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
