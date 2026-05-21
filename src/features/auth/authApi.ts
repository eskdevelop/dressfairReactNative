import axios from 'axios';

import { buildStorefrontStorePublicHeaders } from '@shared/network/storefrontAuthHeaders';
import { storefrontCheckoutUrl, storefrontStoreUrl } from '@shared/config/storefrontUrls';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { parseAuthResponse, parseRegisterResponse } from './parseAuthResponse';
import type { AuthApiResult, RegisterFields } from './authTypes';

const AUTH_TIMEOUT_MS = 20000;

async function postCheckoutAuth(
  path: string,
  body: Record<string, string>,
  event: string,
): Promise<AuthApiResult> {
  try {
    const headers = buildStorefrontStorePublicHeaders();
    const url = storefrontCheckoutUrl(path);
    const response = await axios.post(url, body, {
      headers,
      timeout: AUTH_TIMEOUT_MS,
    });
    analytics.track(event, { ok: true });
    return parseAuthResponse(response.data);
  } catch (error) {
    crashReporter.capture(error, { source: `authApi.${event}` });
    analytics.track(event, { ok: false });
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const parsed = parseAuthResponse(data);
        if (!parsed.success) return parsed;
      }
      return {
        success: false,
        message: error.message || 'Network error. Please try again.',
      };
    }
    return { success: false, message: 'Network error. Please try again.' };
  }
}

async function postStoreAuth(
  path: string,
  body: Record<string, string>,
  event: string,
): Promise<AuthApiResult> {
  try {
    const headers = buildStorefrontStorePublicHeaders();
    const url = storefrontStoreUrl(path);
    const response = await axios.post(url, body, {
      headers,
      timeout: AUTH_TIMEOUT_MS,
    });
    analytics.track(event, { ok: true });
    return parseAuthResponse(response.data);
  } catch (error) {
    crashReporter.capture(error, { source: `authApi.${event}` });
    analytics.track(event, { ok: false });
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const parsed = parseAuthResponse(data);
        if (!parsed.success) return parsed;
      }
      return {
        success: false,
        message: error.message || 'Network error. Please try again.',
      };
    }
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function sendWhatsAppOtp(fullPhone: string): Promise<AuthApiResult> {
  return postCheckoutAuth(
    'send/otp',
    { mobile_number: fullPhone },
    'auth_whatsapp_send_otp',
  );
}

export async function verifyWhatsAppOtp(
  fullPhone: string,
  otp: string,
): Promise<AuthApiResult> {
  return postCheckoutAuth(
    'login/otp',
    { otp, mobile_number: fullPhone },
    'auth_whatsapp_verify_otp',
  );
}

export async function loginEmailPassword(
  email: string,
  password: string,
): Promise<AuthApiResult> {
  return postCheckoutAuth(
    'customer/mobile-login',
    { email, password },
    'auth_email_password',
  );
}

export async function verifyEmailOtp(email: string, otp: string): Promise<AuthApiResult> {
  return postCheckoutAuth(
    'customer/mobile-email-otp',
    { otp, email },
    'auth_email_verify_otp',
  );
}

export async function registerAccount(fields: RegisterFields): Promise<AuthApiResult> {
  try {
    const headers = buildStorefrontStorePublicHeaders();
    const url = storefrontCheckoutUrl('customer/register');
    const response = await axios.post(
      url,
      {
        first_name: fields.firstName,
        last_name: fields.lastName,
        email: fields.email,
        mobile: fields.mobile,
        password: fields.password,
      },
      { headers, timeout: AUTH_TIMEOUT_MS },
    );
    analytics.track('auth_register', { ok: true });
    return parseRegisterResponse(response.data);
  } catch (error) {
    crashReporter.capture(error, { source: 'authApi.register' });
    analytics.track('auth_register', { ok: false });
    if (axios.isAxiosError(error) && error.response?.data) {
      const parsed = parseRegisterResponse(error.response.data);
      if (!parsed.success) return parsed;
    }
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

export async function loginWithApple(identityToken: string): Promise<AuthApiResult> {
  return postStoreAuth(
    'auth/apple/login',
    { token: identityToken },
    'auth_apple_login',
  );
}
