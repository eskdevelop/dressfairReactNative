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

/** Full cart from web `localStorage` key `cart`. */
export type CartSnapshotBridgeMessage = {
  type: 'cart_snapshot';
  items: unknown[];
  source?: string;
};

/** Search tab: report whether the browsing-history page shows product hits (native section title). */
export type BrowsingHistoryLayoutBridgeMessage = {
  type: 'browsing_history_layout';
  has_items: boolean;
};

export type BridgeMessage =
  | AuthBridgeMessage
  | LogoutBridgeMessage
  | OpenExternalBridgeMessage
  | OpenSettingsBridgeMessage
  | CartCountBridgeMessage
  | CartSnapshotBridgeMessage
  | BrowsingHistoryLayoutBridgeMessage;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

// Hard cap: if a single bridge payload is larger than this, something is
// wrong (or the page is trying to wedge native parsing). 16 KiB easily covers
// any legitimate session token or URL.
const MAX_PAYLOAD_BYTES = 16 * 1024;
const MAX_CART_PAYLOAD_BYTES = 512 * 1024;

const parseJsonPayload = (raw: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

export const parseBridgeMessage = (raw: unknown): BridgeMessage | null => {
  if (typeof raw !== 'string' || raw.length === 0) return null;

  const maxBytes =
    raw.includes('"cart_snapshot"') || raw.includes("'cart_snapshot'")
      ? MAX_CART_PAYLOAD_BYTES
      : MAX_PAYLOAD_BYTES;
  if (raw.length > maxBytes) return null;

  const parsed = parseJsonPayload(raw);
  if (!parsed) return null;
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
  if (type === 'cart_snapshot') {
    const items = parsed.items;
    if (!Array.isArray(items)) return null;
    const source = typeof parsed.source === 'string' ? parsed.source : undefined;
    return { type, items, source };
  }
  if (type === 'browsing_history_layout') {
    const hi = parsed.has_items;
    if (hi !== true && hi !== false) return null;
    return { type, has_items: hi };
  }
  return null;
};
