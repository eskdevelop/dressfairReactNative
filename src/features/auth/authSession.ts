import type { AppDispatch } from '@app/store';
import { setAuthenticated } from '@app/storeSlices/appSlice';
import { fetchCustomerProfile } from '@features/account/customerApi';
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
    dispatch(setAuthenticated(true));
    analytics.track('auth_native_session_saved', { token_length: token.length });

    const profileResult = await fetchCustomerProfile();
    if (profileResult.ok) {
      await saveCachedProfile(country, profileResult.profile);
    }

    return { ok: true };
  } catch (error) {
    crashReporter.capture(error, { source: 'authSession.completeNativeLogin' });
    return { ok: false, message: 'Unable to save login session. Please try again.' };
  }
}
