import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { loginWithApple } from './authApi';
import { completeNativeLogin } from './authSession';

export type AppleAuthResult =
  | { ok: true }
  | { ok: false; message?: string; cancelled?: boolean };

/**
 * Native Sign in with Apple (iOS). Uses expo-apple-authentication when available.
 */
export async function signInWithAppleNative(): Promise<AppleAuthResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, message: 'Sign in with Apple is only available on iOS.' };
  }

  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return { ok: false, message: 'Sign in with Apple is not available on this device.' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const identityToken = credential.identityToken;
    if (!identityToken) {
      return { ok: false, message: 'Apple did not return an identity token.' };
    }

    analytics.track('auth_apple_native_tap');
    const apiResult = await loginWithApple(identityToken);
    if (!apiResult.success || !apiResult.token) {
      return { ok: false, message: apiResult.message ?? 'Apple login failed.' };
    }

    const country = store.getState().app.country as CountryCode;
    const session = await completeNativeLogin(apiResult.token, store.dispatch, country);
    if (!session.ok) {
      return { ok: false, message: session.message };
    }

    return { ok: true };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, cancelled: true };
    }
    crashReporter.capture(error, { source: 'appleAuth.signInWithAppleNative' });
    return { ok: false, message: err.message ?? 'Sign in with Apple failed.' };
  }
}
