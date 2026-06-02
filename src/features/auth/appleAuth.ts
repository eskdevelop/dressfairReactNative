import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { store } from '@app/store';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { loginWithApple } from './authApi';
import { completeNativeLogin } from './authSession';
import { appleRedirectUri, appleServicesId } from './socialAuthConfig';

WebBrowser.maybeCompleteAuthSession();

export type AppleAuthResult =
  | { ok: true }
  | { ok: false; message?: string; cancelled?: boolean };

const APPLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
  tokenEndpoint: 'https://appleid.apple.com/auth/token',
};

/** Build the web `user` JSON Apple expects from a native fullName, when present. */
function appleUserJson(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string {
  const given = fullName?.givenName ?? '';
  const family = fullName?.familyName ?? '';
  if (!given && !family) return '';
  try {
    return JSON.stringify({ name: { firstName: given, lastName: family } });
  } catch {
    return '';
  }
}

async function finishAppleLogin(identityToken: string, user: string): Promise<AppleAuthResult> {
  const apiResult = await loginWithApple(identityToken, user);
  if (!apiResult.success || !apiResult.token) {
    return { ok: false, message: apiResult.message ?? 'Apple login failed.' };
  }
  const country = store.getState().app.country as CountryCode;
  const session = await completeNativeLogin(apiResult.token, store.dispatch, country);
  if (!session.ok) {
    return { ok: false, message: session.message };
  }
  return { ok: true };
}

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
    return await finishAppleLogin(identityToken, appleUserJson(credential.fullName));
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, cancelled: true };
    }
    crashReporter.capture(error, { source: 'appleAuth.signInWithAppleNative' });
    // ASAuthorizationError 1000 ("authorization attempt failed for an unknown
    // reason") almost always means the device isn't signed into iCloud (or the
    // build is missing the Sign in with Apple entitlement). Surface actionable
    // guidance instead of Apple's opaque message.
    const message = err.message ?? '';
    const isUnknownAuthFailure =
      err.code === 'ERR_REQUEST_UNKNOWN' ||
      err.code === 'ERR_REQUEST_NOT_HANDLED' ||
      /unknown reason|not handled/i.test(message);
    if (isUnknownAuthFailure) {
      return {
        ok: false,
        message:
          'Apple could not sign you in. Make sure this device is signed into iCloud (Settings > Sign in to your iPhone), then try again. On the iOS Simulator this can be unreliable — a real iPhone works best.',
      };
    }
    return { ok: false, message: message || 'Sign in with Apple failed.' };
  }
}

/**
 * Sign in with Apple via the web OAuth flow (Android). Requires an Apple
 * "Services ID" + Return URL configured in the Apple Developer portal and set
 * in `app.json` -> `expo.extra` (appleServicesId / appleRedirectUri). Apple
 * returns an `id_token` we exchange at the same `store/auth/apple/login` endpoint.
 *
 * Note: requesting name/email forces Apple's `form_post` response mode, so the
 * Return URL must point at a relay you control that 302-redirects the posted
 * params back to `appleRedirectUri` (app deep link). Without that relay, Apple
 * cannot deliver the token to the app.
 */
export async function signInWithAppleWeb(): Promise<AppleAuthResult> {
  if (!appleServicesId || !appleRedirectUri) {
    return {
      ok: false,
      message: 'Sign in with Apple is not configured for this platform yet.',
    };
  }

  try {
    analytics.track('auth_apple_web_tap');
    const request = new AuthSession.AuthRequest({
      clientId: appleServicesId,
      redirectUri: appleRedirectUri,
      responseType: 'code id_token',
      scopes: ['name', 'email'],
      extraParams: { response_mode: 'form_post' },
      usePKCE: false,
    });

    const result = await request.promptAsync(APPLE_DISCOVERY);
    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { ok: false, cancelled: true };
    }
    if (result.type !== 'success') {
      return { ok: false, message: 'Sign in with Apple was not completed.' };
    }

    const idToken = result.params.id_token;
    if (!idToken) {
      return { ok: false, message: 'Apple did not return an identity token.' };
    }
    const user = typeof result.params.user === 'string' ? result.params.user : '';
    return await finishAppleLogin(idToken, user);
  } catch (error) {
    crashReporter.capture(error, { source: 'appleAuth.signInWithAppleWeb' });
    const err = error as { message?: string };
    return { ok: false, message: err.message ?? 'Sign in with Apple failed.' };
  }
}

/** Unified entry point — native flow on iOS, web OAuth flow elsewhere. */
export async function signInWithApple(): Promise<AppleAuthResult> {
  return Platform.OS === 'ios' ? signInWithAppleNative() : signInWithAppleWeb();
}
