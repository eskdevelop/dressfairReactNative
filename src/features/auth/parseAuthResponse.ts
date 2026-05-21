import { extractCustomerTokenFromLoginResponse } from '@features/webview/loginResponseAuth';

import type { AuthApiResult, AuthCustomerSummary } from './authTypes';

function isSuccessFlag(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  );
}

function parseCustomer(raw: unknown): AuthCustomerSummary | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const c = raw as Record<string, unknown>;
  return {
    id: c.id as string | number | undefined,
    firstname: typeof c.firstname === 'string' ? c.firstname : undefined,
    lastname: typeof c.lastname === 'string' ? c.lastname : undefined,
    email: typeof c.email === 'string' ? c.email : undefined,
    mobile: typeof c.mobile === 'string' ? c.mobile : undefined,
  };
}

/** Parses OpenCart auth JSON envelopes from login/register APIs. */
export function parseAuthResponse(data: unknown): AuthApiResult {
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'Unexpected response from server.' };
  }
  const root = data as Record<string, unknown>;
  const ok = isSuccessFlag(root.success);
  const message =
    typeof root.message === 'string'
      ? root.message
      : typeof root.error === 'string'
        ? root.error
        : undefined;

  if (!ok) {
    return {
      success: false,
      message: message ?? 'Request failed.',
      error: typeof root.error === 'string' ? root.error : undefined,
    };
  }

  const tokenFromField =
    typeof root.token === 'string' && root.token.length >= 20 ? root.token : null;
  const token =
    tokenFromField ??
    extractCustomerTokenFromLoginResponse(JSON.stringify(root));

  if (token) {
    return {
      success: true,
      token,
      customer: parseCustomer(root.customer),
      message,
    };
  }

  return { success: true, token: '', message };
}

/** Register succeeds without returning a JWT — caller should route to email login. */
export function parseRegisterResponse(data: unknown): AuthApiResult {
  const parsed = parseAuthResponse(data);
  if (!parsed.success) return parsed;
  if (parsed.token.length >= 20) return parsed;
  return { success: true, token: '', message: parsed.message };
}
