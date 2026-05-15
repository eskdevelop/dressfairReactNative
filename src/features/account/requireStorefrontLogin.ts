import { CommonActions } from '@react-navigation/native';

import type { CountryCode } from '@shared/config/env';

import { navigationRef, openWebPath } from '@navigation/navigationRef';

import { storefrontSignInEmbedPath } from './storefrontLoginPath';

export function openStorefrontLogin(country: CountryCode): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate({ name: 'StorefrontLoginWeb' }));
    return;
  }

  /** Splash/hand-off: stack unavailable yet — reuse Home-tab WebView redirect */
  openWebPath(storefrontSignInEmbedPath(country));
}

/** If guest, sends user to storefront login and returns true. Otherwise false. */
export function ifGuestOpenLogin(isAuthenticated: boolean, country: CountryCode): boolean {
  if (isAuthenticated) return false;
  openStorefrontLogin(country);
  return true;
}
