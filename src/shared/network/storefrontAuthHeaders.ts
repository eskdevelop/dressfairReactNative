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
function buildStorefrontCountryContextHeaders(): Record<string, string> {
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
 * Auth headers for storefront `/api/rest/store/...` JSON APIs (same JWT as
 * Flutter `NetworkApiService`), plus OpenCart merchant + session context.
 */
export const buildStorefrontAuthHeaders = async (): Promise<
  Record<string, string>
> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-oc-merchant-id': OC_MERCHANT_ID,
    'x-oc-merchant-language': OC_MERCHANT_LANGUAGE,
    ...buildStorefrontCountryContextHeaders(),
  };
  const apiSessionToken = store.getState().app.apiSession?.token;
  if (apiSessionToken && apiSessionToken.length > 0) {
    headers['x-oc-session'] = apiSessionToken;
  }
  const userToken = await sessionStore.getToken();
  if (userToken && userToken.length > 0) {
    headers.Authorization = `Bearer ${userToken}`;
    headers['x-customer-token'] = userToken;
    headers['x-customer-session'] = userToken;
  }
  return headers;
};

/** Same auth as JSON storefront calls but omits `Content-Type` so multipart boundary is set automatically. */
export const buildStorefrontAuthHeadersMultipart = async (): Promise<
  Record<string, string>
> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-oc-merchant-id': OC_MERCHANT_ID,
    'x-oc-merchant-language': OC_MERCHANT_LANGUAGE,
    ...buildStorefrontCountryContextHeaders(),
  };
  const apiSessionToken = store.getState().app.apiSession?.token;
  if (apiSessionToken && apiSessionToken.length > 0) {
    headers['x-oc-session'] = apiSessionToken;
  }
  const userToken = await sessionStore.getToken();
  if (userToken && userToken.length > 0) {
    headers.Authorization = `Bearer ${userToken}`;
    headers['x-customer-token'] = userToken;
    headers['x-customer-session'] = userToken;
  }
  return headers;
};
