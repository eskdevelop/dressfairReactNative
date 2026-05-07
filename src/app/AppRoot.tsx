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
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { perf } from '@shared/observability/performance';
import { setAuthenticated, setBootstrapped, setOffline } from './storeSlices/appSlice';

export function AppRoot() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    perf.start('app_bootstrap');
    const bootstrap = async () => {
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
      dispatch(setAuthenticated(Boolean(tokenResult)));
      dispatch(setBootstrapped(true));

      // Fire-and-forget: refresh the API session token in the background if
      // we did not already have one in SecureStore. Search calls succeed even
      // before this resolves because OpenCart treats unknown sessions as
      // anonymous; this just promotes us to a tracked session for analytics.
      if (apiSessionResult === null && !isOffline) {
        void bootstrapSession();
      }
      const elapsed = perf.end('app_bootstrap');
      if (elapsed !== null) {
        analytics.track('app_bootstrap_complete', {
          elapsedMs: elapsed,
          networkProbeOk: networkResult !== null,
          isOffline,
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
