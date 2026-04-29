import { setAuthenticated } from '@app/storeSlices/appSlice';
import { store } from '@app/store';
import { openWebPath } from '@navigation/navigationRef';
import { getEnvConfig } from '@shared/config/env';

import { sessionStore } from './sessionStore';

export const logoutEverywhere = async (): Promise<void> => {
  await sessionStore.clear();
  store.dispatch(setAuthenticated(false));

  const { webLogoutPath } = getEnvConfig(store.getState().app.country);
  openWebPath(webLogoutPath);
};
