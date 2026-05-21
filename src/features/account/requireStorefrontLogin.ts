import { CommonActions } from '@react-navigation/native';

import type { CountryCode } from '@shared/config/env';

import { navigationRef, openWebPath } from '@navigation/navigationRef';

export function openStorefrontLogin(_country: CountryCode): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate({ name: 'NativeLogin' }));
    return;
  }

  /** Splash/hand-off: stack unavailable yet — fall back to Home WebView path */
  openWebPath('/');
}

/** If guest, sends user to storefront login and returns true. Otherwise false. */
export function ifGuestOpenLogin(isAuthenticated: boolean, country: CountryCode): boolean {
  if (isAuthenticated) return false;
  openStorefrontLogin(country);
  return true;
}
