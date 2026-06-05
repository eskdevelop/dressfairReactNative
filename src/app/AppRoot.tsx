import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Network from 'expo-network';

// PUSH DISABLED: import { startNotificationRuntime } from '@features/notifications/notificationRuntime';
import { flushPendingNavigation, navigationRef } from '@navigation/navigationRef';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAppDispatch } from './hooks';
import { sessionStore } from '@features/auth/sessionStore';
import {
  bootstrapSession,
  hydrateSessionFromStorage,
} from '@features/api/sessionApi';
import { prefetchCategoryTreeQuery } from '@features/categories/useCategoryTreeQuery';
import { prefetchNewArrivalsPage1Query } from '@features/account/useNewArrivalsQuery';
import { fetchStoreSettingsFromNetwork } from '@features/store/storeSettingsApi';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { perf } from '@shared/observability/performance';
import { loadPersistedCountry } from '@features/region/persistedCountry';
import { store } from './store';
import { setBootstrapped, setCountry, setCustomerSessionToken, setOffline, setStoreCurrencySettings, setStorefrontCheckoutApiOriginOverride, setStoreOpenCartCountryId } from './storeSlices/appSlice';

export function AppRoot() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    perf.start('app_bootstrap');
    const bootstrap = async () => {
      const persistedCountry = await loadPersistedCountry();
      if (persistedCountry) {
        dispatch(setCountry(persistedCountry));
      }

      // Resolve network and session in parallel but isolate their failure
      // domains: a SecureStore hiccup must not flip the user offline, and a
      // network probe error must not log them out. `isInternetReachable` is
      // tri-state (true / false / null=unknown); only an explicit `false`
      // is treated as offline so unknown states default to letting the
      // WebView attempt the load and surface its own error UI on failure.
      const [networkResult, tokenResult, apiSessionResult] = await Promise.all([
        Network.getNetworkStateAsync().catch(error => {
          crashReporter.capture(error, { source: 'bootstrap.network' });
          return null;
        }),
        sessionStore.getToken().catch(error => {
          crashReporter.capture(error, { source: 'bootstrap.session' });
          return null;
        }),
        // Hydrate the OpenCart REST session token from SecureStore. This
        // never throws (errors are funnelled through crashReporter), so the
        // bootstrap remains failure-isolated from the search subsystem.
        hydrateSessionFromStorage(),
      ]);

      if (!mounted) return;
      const isOffline = networkResult?.isInternetReachable === false;
      dispatch(setOffline(isOffline));
      dispatch(setCustomerSessionToken(tokenResult));

      if (apiSessionResult === null && !isOffline) {
        // Home WebView does not need the REST session; fetch in background so tabs appear sooner.
        void bootstrapSession();
      }

      const country = store.getState().app.country;

      dispatch(setBootstrapped(true));

      const elapsed = perf.end('app_bootstrap');
      if (elapsed !== null) {
        analytics.track('app_bootstrap_complete', {
          elapsedMs: elapsed,
          networkProbeOk: networkResult !== null,
          isOffline,
          categoryPrefetchMs: 0,
          categoryPrefetchOutcome: isOffline ? 'offline' : 'deferred',
        });
      }

      if (!isOffline) {
        void fetchStoreSettingsFromNetwork(country).then(res => {
          if (!mounted || !res.ok || !res.settings) return;
          dispatch(
            setStoreCurrencySettings({
              ...res.settings,
              mobileNationalLength: res.mobileNationalLength ?? null,
              mobileDialCode: res.mobileDialCode ?? null,
            }),
          );
          dispatch(setStorefrontCheckoutApiOriginOverride(res.checkoutApiOriginOverride ?? null));
          dispatch(setStoreOpenCartCountryId(res.openCartCountryId ?? null));
        });

        const prefetchT0 = Date.now();
        void prefetchCategoryTreeQuery(country).then(r => {
          if (!mounted) return;
          analytics.track('app_category_prefetch_complete', {
            elapsedMs: Date.now() - prefetchT0,
            categoryPrefetchOutcome: r.skipped ? 'skipped' : r.ok ? 'ok' : 'fail',
          });
        });

        void prefetchNewArrivalsPage1Query(country).then(() => {
          if (!mounted) return;
          analytics.track('app_new_arrivals_prefetch_complete', {
            elapsedMs: Date.now() - prefetchT0,
          });
        });
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // PUSH DISABLED
  // useEffect(() => {
  //   return startNotificationRuntime();
  // }, []);

  // Push permission is intentionally NOT auto-requested at launch. It is
  // user-initiated from the Menu screen ("Enable order updates"). Apple's
  // 4.2 review feedback flagged silent push prompts as not contributing to
  // a robust native experience, so we tie the prompt to an explicit tap.

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        flushPendingNavigation();
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
