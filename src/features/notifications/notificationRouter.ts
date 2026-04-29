import { store } from '@app/store';
import { getEnvConfig } from '@shared/config/env';
import { isAllowedUrl } from '@shared/webview/urlPolicy';

export type PushPayload = {
  type?: string;
  path?: string;
};

const webBaseForCurrentCountry = (): string => {
  const country = store.getState().app.country;
  return getEnvConfig(country).webBaseUrl;
};

export const mapPayloadToWebPath = (payload?: PushPayload): string => {
  if (!payload || payload.type !== 'web_route' || !payload.path) {
    return '/';
  }
  const candidateUrl = `${webBaseForCurrentCountry()}${payload.path}`;
  return isAllowedUrl(candidateUrl) ? payload.path : '/';
};

const isPathOnly = (value: string): boolean =>
  value.startsWith('/') && !value.includes('://');

export const mapIncomingUrlToWebPath = (incomingUrl?: string | null): string => {
  if (!incomingUrl) return '/';
  try {
    const parsed = new URL(incomingUrl);
    if (parsed.protocol === 'dressfair:') {
      const raw = parsed.searchParams.get('path') ?? '/';
      if (!isPathOnly(raw) && raw !== '/') {
        return '/';
      }
      const candidateUrl = `${webBaseForCurrentCountry()}${raw}`;
      return isAllowedUrl(candidateUrl) ? raw : '/';
    }
    const candidateUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    if (!isAllowedUrl(candidateUrl)) return '/';
    return parsed.pathname + (parsed.search ?? '');
  } catch {
    return '/';
  }
};
