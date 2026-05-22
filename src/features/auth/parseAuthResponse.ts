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

function extractTokenFromAuthPayload(root: Record<string, unknown>): string | null {
  const direct =
    typeof root.token === 'string' && root.token.length >= 20 ? root.token : null;
  if (direct) return direct;

  const nestedKeys = ['data', 'customer', 'result'];
  for (const key of nestedKeys) {
    const nested = root[key];
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) continue;
    const row = nested as Record<string, unknown>;
    const fromNested =
      (typeof row.token === 'string' && row.token.length >= 20 ? row.token : null) ??
      (typeof row.session_token === 'string' && row.session_token.length >= 20
        ? row.session_token
        : null) ??
      (typeof row.access_token === 'string' && row.access_token.length >= 20
        ? row.access_token
        : null);
    if (fromNested) return fromNested;
  }
  return null;
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

  const tokenFromField = extractTokenFromAuthPayload(root);
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
