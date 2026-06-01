import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { loginWithGoogle } from './authApi';
import { completeNativeLogin } from './authSession';
import { googleIosClientId, googleWebClientId } from './socialAuthConfig';

export type GoogleAuthResult =
  | { ok: true }
  | { ok: false; message?: string; cancelled?: boolean };

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: googleWebClientId || undefined,
    iosClientId: googleIosClientId || undefined,
    offlineAccess: false,
  });
  configured = true;
}

/**
 * Native Google Sign-In (Android + iOS). Obtains the Google OAuth access token
 * and exchanges it at the backend (`store/auth/google/login`) for the app JWT —
 * same contract as the dressfair.com web flow.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  if (!googleWebClientId && !googleIosClientId) {
    return {
      ok: false,
      message: 'Google sign in is not configured yet. Please try another method.',
    };
  }

  try {
    ensureConfigured();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    analytics.track('auth_google_native_tap');
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return { ok: false, cancelled: true };
    }

    // Backend expects the Google OAuth access token (`ya29...`), not the ID token.
    const { accessToken } = await GoogleSignin.getTokens();
    if (!accessToken) {
      return { ok: false, message: 'Google did not return an access token.' };
    }

    const apiResult = await loginWithGoogle(accessToken);
    if (!apiResult.success || !apiResult.token) {
      return { ok: false, message: apiResult.message ?? 'Google login failed.' };
    }

    const country = store.getState().app.country as CountryCode;
    const session = await completeNativeLogin(apiResult.token, store.dispatch, country);
    if (!session.ok) {
      return { ok: false, message: session.message };
    }

    return { ok: true };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { ok: false, cancelled: true };
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        return { ok: false, cancelled: true };
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { ok: false, message: 'Google Play Services is not available on this device.' };
      }
    }
    crashReporter.capture(error, { source: 'googleAuth.signInWithGoogle' });
    const err = error as { message?: string };
    return { ok: false, message: err.message ?? 'Sign in with Google failed.' };
  }
}

/**
 * Best-effort revoke of the native Google session so the next sign-in shows the
 * account chooser instead of silently reusing the previous account. Safe to call
 * even when the user never signed in with Google.
 */
export async function signOutGoogle(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch (error) {
    crashReporter.capture(error, { source: 'googleAuth.signOutGoogle' });
  }
}
