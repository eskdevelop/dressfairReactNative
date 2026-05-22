import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Network from 'expo-network';

import { startNotificationRuntime } from '@features/notifications/notificationRuntime';
import { flushPendingNavigation, navigationRef } from '@navigation/navigationRef';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAppDispatch } from './hooks';
import { sessionStore } from '@features/auth/sessionStore';
import {
  bootstrapSession,
  hydrateSessionFromStorage,
} from '@features/api/sessionApi';
import { prefetchCategoryCacheIfStale } from '@features/categories/categoryHydration';
import { fetchStoreSettingsFromNetwork } from '@features/store/storeSettingsApi';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { perf } from '@shared/observability/performance';
import { loadPersistedCountry } from '@features/region/persistedCountry';
import { store } from './store';
import { setBootstrapped, setCountry, setCustomerSessionToken, setOffline, setStoreCurrencySettings, setStorefrontCheckoutApiOriginOverride, setStoreOpenCartCountryId } from './storeSlices/appSlice';

const CATEGORY_PREFETCH_MAX_MS = 2500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

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
        await bootstrapSession();
      }

      let categoryPrefetchMs = 0;
      let categoryPrefetchOutcome: 'offline' | 'skipped' | 'ok' | 'fail' | 'timeout' = 'offline';
      const country = store.getState().app.country;
      const prefetchT0 = Date.now();

      if (!isOffline) {
        void fetchStoreSettingsFromNetwork(country).then(res => {
          if (!mounted || !res.ok || !res.settings) return;
          dispatch(setStoreCurrencySettings(res.settings));
          dispatch(setStorefrontCheckoutApiOriginOverride(res.checkoutApiOriginOverride ?? null));
          dispatch(setStoreOpenCartCountryId(res.openCartCountryId ?? null));
        });

        const prefetchPromise = prefetchCategoryCacheIfStale(country).then(r => ({
          timedOut: false as const,
          ok: r.ok,
          skipped: r.skipped,
        }));
        const race = await Promise.race([
          prefetchPromise,
          delay(CATEGORY_PREFETCH_MAX_MS).then(() => ({ timedOut: true as const })),
        ]);
        categoryPrefetchMs = Date.now() - prefetchT0;
        if ('timedOut' in race && race.timedOut) {
          categoryPrefetchOutcome = 'timeout';
        } else if (!race.timedOut) {
          if (race.skipped) categoryPrefetchOutcome = 'skipped';
          else if (race.ok) categoryPrefetchOutcome = 'ok';
          else categoryPrefetchOutcome = 'fail';
        }
      }

      dispatch(setBootstrapped(true));

      const elapsed = perf.end('app_bootstrap');
      if (elapsed !== null) {
        analytics.track('app_bootstrap_complete', {
          elapsedMs: elapsed,
          networkProbeOk: networkResult !== null,
          isOffline,
          categoryPrefetchMs,
          categoryPrefetchOutcome,
        });
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    return startNotificationRuntime();
  }, []);

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
