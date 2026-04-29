export type CountryCode = 'UAE' | 'OMN' | 'KSA';

export type EnvConfig = {
  apiBaseUrl: string;
  webBaseUrl: string;
  allowedDomains: string[];
  webLoginPath: string;
  webLogoutPath: string;
};

const configs: Record<CountryCode, EnvConfig> = {
  UAE: {
    apiBaseUrl:
      'https://backend.dressfair.com/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.com',
    allowedDomains: ['www.dressfair.com', 'backend.dressfair.com'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
  },
  OMN: {
    apiBaseUrl:
      'https://backend.dressfair.om/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.om',
    allowedDomains: ['www.dressfair.om', 'backend.dressfair.om'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
  },
  KSA: {
    apiBaseUrl:
      'https://backendsa.dressfair.com/index.php?route=extension/opencart',
    webBaseUrl: 'https://sa.dressfair.com',
    allowedDomains: ['sa.dressfair.com', 'backendsa.dressfair.com'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
  },
};

export const getEnvConfig = (country: CountryCode): EnvConfig => configs[country];
