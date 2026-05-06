import axios from 'axios';

import { store } from '@app/store';
import { setApiSession } from '@app/storeSlices/appSlice';
import { getEnvConfig } from '@shared/config/env';
import { crashReporter } from '@shared/observability/crash';

import { apiSessionStore } from './apiSessionStore';

// Merchant identifier expected by the OpenCart REST plugin on every call.
// Mirrors the constant used by the Flutter app's `NetworkApiService`.
export const OC_MERCHANT_ID = 'CZ3acNSs58SBlZ2Vq1jWW1wUkr4yZqiJ';
export const OC_MERCHANT_LANGUAGE = 'en-gb';

const SESSION_TIMEOUT_MS = 15000;

const buildSessionUrl = (): string => {
  const country = store.getState().app.country;
  const { apiHost, apiRoutePrefix } = getEnvConfig(country);
  return `${apiHost}${apiRoutePrefix}/rest_api.session`;
};

const extractToken = (data: unknown): string | null => {
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    const inner = root.data;
    if (inner && typeof inner === 'object') {
      const token = (inner as Record<string, unknown>).session;
      if (typeof token === 'string' && token.length > 0) return token;
    }
    // Some OpenCart variants flatten the session onto the root.
    if (typeof root.session === 'string' && root.session.length > 0) {
      return root.session;
    }
  }
  return null;
};

const fetchSessionOnce = async (): Promise<string | null> => {
  const url = buildSessionUrl();
  const response = await axios.get(url, {
    timeout: SESSION_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
      'x-oc-merchant-id': OC_MERCHANT_ID,
    },
  });
  return extractToken(response.data);
};

// Fetch a session token from `rest_api.session`, persist it, and mirror it
// into Redux so the apiClient interceptor can attach `x-oc-session` on the
// very next request. Failure is swallowed: the search tab degrades to
// no-results-with-Retry rather than crashing the bootstrap.
export const bootstrapSession = async (): Promise<string | null> => {
  try {
    let token = await fetchSessionOnce();
    if (token === null) {
      // One retry — covers the common "OpenCart cold start" 502 / empty body.
      token = await fetchSessionOnce();
    }
    if (token !== null) {
      await apiSessionStore.saveToken(token);
      store.dispatch(setApiSession(token));
    }
    return token;
  } catch (error) {
    crashReporter.capture(error, { source: 'sessionApi.bootstrapSession' });
    return null;
  }
};

// Re-hydrate Redux from SecureStore on app start. Does not touch the network.
export const hydrateSessionFromStorage = async (): Promise<string | null> => {
  try {
    const token = await apiSessionStore.getToken();
    if (token !== null && token.length > 0) {
      store.dispatch(setApiSession(token));
      return token;
    }
    return null;
  } catch (error) {
    crashReporter.capture(error, { source: 'sessionApi.hydrate' });
    return null;
  }
};
