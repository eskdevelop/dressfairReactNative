import { store } from '@app/store';
import { getEnvConfig } from '@shared/config/env';

export type PushPayload = {
  type?: string;
  path?: string;
};

const HOME_PATH = '/';

const webBaseForCurrentCountry = (): string => {
  const country = store.getState().app.country;
  return getEnvConfig(country).webBaseUrl;
};

const allowedHostsForCurrentCountry = (): Set<string> => {
  const country = store.getState().app.country;
  return new Set(getEnvConfig(country).allowedDomains);
};

// Resolve `rawPath` against `webBase` and return the path+search if and only
// if the resulting host is in the storefront allowlist for the current
// country. This catches:
//   • Protocol-relative paths     ("//evil.com/x"  → resolves to evil.com)
//   • Backslash-prefixed paths    ("\\evil.com/x"  → some parsers normalise to //evil.com)
//   • Absolute URLs in the field  ("https://evil.com")
//   • Percent-encoded host smuggling ("/%2f%2fevil.com/x")
const resolveSafePath = (rawPath: string): string => {
  if (typeof rawPath !== 'string' || rawPath.length === 0) return HOME_PATH;
  // Reject control characters, backslashes (treated as path separators by
  // some URL parsers), and any non-/ leading character — push payloads must
  // describe a path, never an absolute URL or scheme.
  if (!rawPath.startsWith('/')) return HOME_PATH;
  if (/[\\\u0000-\u001f]/.test(rawPath)) return HOME_PATH;
  // Reject protocol-relative paths up front so we never even try to resolve
  // `//evil.com/x` against the base URL.
  if (rawPath.startsWith('//')) return HOME_PATH;

  let resolved: URL;
  try {
    resolved = new URL(rawPath, webBaseForCurrentCountry());
  } catch {
    return HOME_PATH;
  }
  if (!allowedHostsForCurrentCountry().has(resolved.host)) return HOME_PATH;
  // Re-emit only path + search. Drop fragment/hash to avoid bridging
  // attacker-controlled fragments back into the WebView.
  return `${resolved.pathname}${resolved.search}` || HOME_PATH;
};

export const mapPayloadToWebPath = (payload?: PushPayload): string => {
  if (!payload || payload.type !== 'web_route' || typeof payload.path !== 'string') {
    return HOME_PATH;
  }
  return resolveSafePath(payload.path);
};

export const mapIncomingUrlToWebPath = (incomingUrl?: string | null): string => {
  if (!incomingUrl) return HOME_PATH;
  let parsed: URL;
  try {
    parsed = new URL(incomingUrl);
  } catch {
    return HOME_PATH;
  }

  if (parsed.protocol === 'dressfair:') {
    const raw = parsed.searchParams.get('path') ?? HOME_PATH;
    return resolveSafePath(raw);
  }

  if (parsed.protocol !== 'https:') return HOME_PATH;
  if (!allowedHostsForCurrentCountry().has(parsed.host)) return HOME_PATH;
  return `${parsed.pathname}${parsed.search}` || HOME_PATH;
};
