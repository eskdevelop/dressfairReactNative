import { store } from '@app/store';
import {
  OC_MERCHANT_ID,
  OC_MERCHANT_LANGUAGE,
} from '@features/api/sessionApi';
import { sessionStore } from '@features/auth/sessionStore';
import { countryIsoCode2, type CountryCode } from '@shared/config/env';

const COUNTRY_DISPLAY_NAME: Record<CountryCode, string> = {
  UAE: 'United Arab Emirates',
  OMN: 'Oman',
  KSA: 'Saudi Arabia',
};

/**
 * Matches browser storefront `X-Country*` headers so OC `/api/rest/*` JSON returns
 * prices/currency for the active region (not a silent UAE default).
 */
export function buildStorefrontCountryContextHeaders(): Record<string, string> {
  const country = store.getState().app.country as CountryCode;
  const iso = countryIsoCode2(country);
  const pathSeg = country === 'UAE' ? 'ae' : country === 'OMN' ? 'om' : 'sa';
  return {
    'X-Country': pathSeg,
    'X-Country-Iso': iso,
    'X-Country-Name': COUNTRY_DISPLAY_NAME[country],
  };
}

/**
 * Store list GETs for provinces (`/cities/{countryId}`) — Flutter `getCities` uses an empty
 * session token; match by omitting customer JWT (still send merchant + regional context).
 */
export const buildStorefrontStorePublicHeaders = (): Record<string, string> => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'x-oc-merchant-id': OC_MERCHANT_ID,
  'x-oc-merchant-language': OC_MERCHANT_LANGUAGE,
  ...buildStorefrontCountryContextHeaders(),
});

/**
 * Synchronous auth headers from Redux session mirrors — used for WebView
 * `beforeContentLoaded` injection so checkout's first fetch is not a guest race.
 */
export function buildStorefrontAuthHeadersFromSession(
  customerToken: string | null | undefined,
  apiSessionToken: string | null | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-oc-merchant-id': OC_MERCHANT_ID,
    'x-oc-merchant-language': OC_MERCHANT_LANGUAGE,
    ...buildStorefrontCountryContextHeaders(),
  };
  const oc = apiSessionToken?.trim();
  if (oc && oc.length > 0) {
    headers['x-oc-session'] = oc;
  }
  const user = customerToken?.trim();
  if (user && user.length >= 20) {
    headers.Authorization = `Bearer ${user}`;
    headers['x-customer-token'] = user;
    headers['x-customer-session'] = user;
  }
  return headers;
}

/**
 * Auth headers for storefront `/api/rest/store/...` JSON APIs (same JWT as
 * Flutter `NetworkApiService`), plus OpenCart merchant + session context.
 */
export const buildStorefrontAuthHeaders = async (): Promise<
  Record<string, string>
> => {
  const { customerSessionToken, apiSession } = store.getState().app;
  const cached = customerSessionToken?.trim();
  if (cached && cached.length >= 20) {
    return buildStorefrontAuthHeadersFromSession(cached, apiSession?.token);
  }
  const userToken = await sessionStore.getToken();
  return buildStorefrontAuthHeadersFromSession(userToken, apiSession?.token);
};

/** Same auth as JSON storefront calls but omits `Content-Type` so multipart boundary is set automatically. */
export const buildStorefrontAuthHeadersMultipart = async (): Promise<
  Record<string, string>
> => {
  const full = await buildStorefrontAuthHeaders();
  const { 'Content-Type': _omit, ...rest } = full;
  return rest;
};
