import type { AppDispatch } from '@app/store';
import { store } from '@app/store';
import {
  bumpStorefrontSurfaceGeneration,
  setApiSession,
  setCustomerSessionToken,
  setCountry,
  setStoreCurrencySettings,
  setStorefrontCheckoutApiOriginOverride,
  setStoreOpenCartCountryId,
} from '@app/storeSlices/appSlice';
import { clearWebNav } from '@app/storeSlices/webNavSlice';
import { clearNativeCart } from '@features/cart/cartActions';
import { apiSessionStore } from '@features/api/apiSessionStore';
import { bootstrapSession } from '@features/api/sessionApi';
import { clearCachedProfile } from '@features/account/customerProfileCache';
import { clearMobileCategoriesCacheAllRegions } from '@features/categories/categoryCache';
import { clearMemoryListingCache } from '@features/categories/listingCache';
import { fetchNormalizeAndPersist } from '@features/categories/categoryHydration';
import { categoryTreeQueryKey } from '@features/categories/useCategoryTreeQuery';
import { clearNewArrivalsCacheAllRegions } from '@features/account/newArrivalsCache';
import { newArrivalsPage1QueryKey } from '@features/account/useNewArrivalsQuery';
import { queryClient } from '@app/queryClient';
import { sessionStore } from '@features/auth/sessionStore';
import { fetchStoreSettingsFromNetwork } from '@features/store/storeSettingsApi';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { savePersistedCountry } from './persistedCountry';

export type CountryChangeReason = 'storefront_url' | 'native_picker';

let applicationChain: Promise<void> = Promise.resolve();

function enqueue(callback: () => Promise<void>): Promise<void> {
  const next = applicationChain
    .then(callback)
    .catch(error => {
      crashReporter.capture(error, { source: 'region.applyCountryChange.enqueue' });
    });
  applicationChain = next.then(() => undefined);
  return next;
}

/**
 * Flutter `refreshAllData` parity: switching storefront locale clears auth/session caches,
 * repoints OC APIs (setting-derived origin when present), refetches hub categories, and
 * bumps `storefrontSurfaceGeneration` so WebViews remount.
 */
export function applyCountryChange(params: {
  dispatch: AppDispatch;
  nextCountry: CountryCode;
  reason: CountryChangeReason;
}): Promise<void> {
  return enqueue(async () => {
    const { dispatch, nextCountry, reason } = params;
    const prev = store.getState().app.country;
    if (prev === nextCountry) return;

    analytics.track('country_change_begin', { from: prev, to: nextCountry, reason });

    await clearMobileCategoriesCacheAllRegions();
    await clearNewArrivalsCacheAllRegions();
    clearMemoryListingCache();
    queryClient.removeQueries({ queryKey: categoryTreeQueryKey(prev) });
    queryClient.removeQueries({ queryKey: categoryTreeQueryKey(nextCountry) });
    queryClient.removeQueries({ queryKey: newArrivalsPage1QueryKey(prev) });
    queryClient.removeQueries({ queryKey: newArrivalsPage1QueryKey(nextCountry) });
    await clearCachedProfile();

    await sessionStore.clear();
    await apiSessionStore.clear();

    dispatch(setCustomerSessionToken(null));
    dispatch(setApiSession(null));
    await clearNativeCart(dispatch, nextCountry);
    dispatch(clearWebNav());
    dispatch(setStorefrontCheckoutApiOriginOverride(null));
    dispatch(setStoreOpenCartCountryId(null));
    dispatch(setCountry(nextCountry));
    await savePersistedCountry(nextCountry);

    const res = await fetchStoreSettingsFromNetwork(nextCountry);
    if (res.ok && res.settings) {
      dispatch(setStoreCurrencySettings(res.settings));
    }
    dispatch(setStorefrontCheckoutApiOriginOverride(res.checkoutApiOriginOverride ?? null));
    dispatch(setStoreOpenCartCountryId(res.openCartCountryId ?? null));

    dispatch(bumpStorefrontSurfaceGeneration());

    analytics.track('country_change_complete', { from: prev, to: nextCountry, reason });

    const offline = store.getState().app.isOffline;
    if (!offline) {
      void bootstrapSession().catch(error =>
        crashReporter.capture(error, { source: 'region.applyCountryChange.bootstrapSession' }),
      );
      void fetchNormalizeAndPersist(nextCountry).catch(error =>
        crashReporter.capture(error, { source: 'region.applyCountryChange.categories' }),
      );
    }
  });
}
