import { setAuthenticated } from '@app/storeSlices/appSlice';
import { store } from '@app/store';
import { openWebPath } from '@navigation/navigationRef';
import { getEnvConfig } from '@shared/config/env';

import { sessionStore } from './sessionStore';

/** Clears the stored customer JWT and Redux auth flag — no navigation. */
export const clearStoredUserSession = async (): Promise<void> => {
  await sessionStore.clear();
  store.dispatch(setAuthenticated(false));
};

export const logoutEverywhere = async (): Promise<void> => {
  await clearStoredUserSession();

  const { webLogoutPath } = getEnvConfig(store.getState().app.country);
  openWebPath(webLogoutPath);
};
