// Runtime validator for messages received via `WebView#postMessage`. The
// WebView bridge is reachable from JS that we do not fully control (3rd-party
// scripts on the storefront, gateway iframes, browser dev tools), so every
// payload is validated against a discriminated union before we touch
// SecureStore, dispatch Redux actions, or hand a URL to `Linking`.
//
// Returning `null` means "drop the message"; callers should emit telemetry
// rather than treat `null` as an error.

export type AuthBridgeMessage = {
  type: 'auth';
  token: string;
};

export type LogoutBridgeMessage = {
  type: 'logout';
};

export type OpenExternalBridgeMessage = {
  type: 'open_external';
  url: string;
};

export type OpenSettingsBridgeMessage = {
  type: 'open_settings';
};

export type CartCountBridgeMessage = {
  type: 'cart_count';
  quantity: number;
};

export type BridgeMessage =
  | AuthBridgeMessage
  | LogoutBridgeMessage
  | OpenExternalBridgeMessage
  | OpenSettingsBridgeMessage
  | CartCountBridgeMessage;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

// Hard cap: if a single bridge payload is larger than this, something is
// wrong (or the page is trying to wedge native parsing). 16 KiB easily covers
// any legitimate session token or URL.
const MAX_PAYLOAD_BYTES = 16 * 1024;

export const parseBridgeMessage = (raw: unknown): BridgeMessage | null => {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  if (raw.length > MAX_PAYLOAD_BYTES) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isObject(parsed)) return null;
  const { type } = parsed;

  if (type === 'auth') {
    return isNonEmptyString(parsed.token) ? { type, token: parsed.token } : null;
  }
  if (type === 'logout' || type === 'open_settings') {
    return { type };
  }
  if (type === 'open_external') {
    return isNonEmptyString(parsed.url) ? { type, url: parsed.url } : null;
  }
  if (type === 'cart_count') {
    const q = parsed.quantity;
    if (typeof q !== 'number' || !Number.isFinite(q)) return null;
    const quantity = Math.min(Math.max(Math.floor(q), 0), 9999);
    return { type, quantity };
  }
  return null;
};
