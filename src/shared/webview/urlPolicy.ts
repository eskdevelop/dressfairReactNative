import { getEnvConfig } from '@shared/config/env';
import { store } from '@app/store';

export const isAllowedUrl = (url: string): boolean => {
  try {
    const host = new URL(url).host;
    const country = store.getState().app.country;
    return getEnvConfig(country).allowedDomains.includes(host);
  } catch {
    return false;
  }
};
