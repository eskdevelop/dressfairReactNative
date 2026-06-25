import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { store } from '@app/store';
import { bumpStorefrontSurfaceGeneration } from '@app/storeSlices/appSlice';

const STORAGE_KEY = 'dressfair_last_app_version_web_reset';

/** Remount storefront WebViews after an app update so stale web storage cannot crash Next.js. */
export async function remountStorefrontWebViewsIfAppUpgraded(): Promise<void> {
  const version = Constants.expoConfig?.version ?? '0';
  const lastVersion = await AsyncStorage.getItem(STORAGE_KEY);
  if (lastVersion === version) return;
  await AsyncStorage.setItem(STORAGE_KEY, version);
  store.dispatch(bumpStorefrontSurfaceGeneration());
}
