import type { AppDispatch } from '@app/store';
import { store } from '@app/store';
import { bumpStorefrontSurfaceGeneration, setCustomerSessionToken } from '@app/storeSlices/appSlice';
import { fetchCustomerProfileSoft } from '@features/account/customerApi';
import { bootstrapSession } from '@features/api/sessionApi';
import {
  saveCachedProfile,
} from '@features/account/customerProfileCache';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { sessionStore } from './sessionStore';

/**
 * Persists JWT, updates Redux auth flag, and prefetches customer profile —
 * same outcome as Flutter `UserPreferences.setSessionToken` + `getCustomerProfile`.
 */
export async function completeNativeLogin(
  token: string,
  dispatch: AppDispatch,
  country: CountryCode,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!token || token.length < 20) {
    return { ok: false, message: 'Login response did not include a valid session token.' };
  }
  try {
    await sessionStore.saveToken(token);
    dispatch(setCustomerSessionToken(token));
    dispatch(bumpStorefrontSurfaceGeneration());
    analytics.track('auth_native_session_saved', { token_length: token.length });

    if (!store.getState().app.apiSession?.token) {
      await bootstrapSession();
    }

    const profileResult = await fetchCustomerProfileSoft();
    if (profileResult.ok) {
      await saveCachedProfile(country, profileResult.profile);
    }

    return { ok: true };
  } catch (error) {
    crashReporter.capture(error, { source: 'authSession.completeNativeLogin' });
    return { ok: false, message: 'Unable to save login session. Please try again.' };
  }
}
