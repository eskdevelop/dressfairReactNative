import { store } from '@app/store';
import {
  OC_MERCHANT_ID,
  OC_MERCHANT_LANGUAGE,
} from '@features/api/sessionApi';
import { sessionStore } from '@features/auth/sessionStore';

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
