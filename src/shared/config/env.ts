export type CountryCode = 'UAE' | 'OMN' | 'KSA';

export type EnvConfig = {
  apiBaseUrl: string;
  webBaseUrl: string;
  allowedDomains: string[];
  webLoginPath: string;
  webLogoutPath: string;
  // Public web pages reachable from the in-app Settings screen. Each path is
  // joined with `webBaseUrl` at call time so the user lands on the right
  // regional storefront. Update the paths to match the live URLs on
  // dressfair.com / dressfair.om / sa.dressfair.com.
  privacyPolicyPath: string;
  termsPath: string;
  helpSupportPath: string;
  accountDeletionPath: string;
  supportEmail: string;
};

const configs: Record<CountryCode, EnvConfig> = {
  UAE: {
    apiBaseUrl:
      'https://backend.dressfair.com/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.com',
    allowedDomains: ['www.dressfair.com', 'backend.dressfair.com'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.com',
  },
  OMN: {
    apiBaseUrl:
      'https://backend.dressfair.om/index.php?route=extension/opencart',
    webBaseUrl: 'https://www.dressfair.om',
    allowedDomains: ['www.dressfair.om', 'backend.dressfair.om'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.om',
  },
  KSA: {
    apiBaseUrl:
      'https://backendsa.dressfair.com/index.php?route=extension/opencart',
    webBaseUrl: 'https://sa.dressfair.com',
    allowedDomains: ['sa.dressfair.com', 'backendsa.dressfair.com'],
    webLoginPath: '/login',
    webLogoutPath: '/logout',
    privacyPolicyPath: '/privacy',
    termsPath: '/terms',
    helpSupportPath: '/contact',
    accountDeletionPath: '/account/delete',
    supportEmail: 'support@dressfair.com',
  },
};

export const getEnvConfig = (country: CountryCode): EnvConfig => configs[country];
