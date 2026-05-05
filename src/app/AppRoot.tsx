import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Network from 'expo-network';

import { startNotificationRuntime } from '@features/notifications/notificationRuntime';
import { registerForPushNotifications } from '@features/notifications/pushRegistration';
import { flushPendingNavigation, navigationRef } from '@navigation/navigationRef';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAppDispatch } from './hooks';
import { sessionStore } from '@features/auth/sessionStore';
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
      const [networkResult, tokenResult] = await Promise.all([
        Network.getNetworkStateAsync().catch(error => {
          crashReporter.capture(error, { source: 'bootstrap.network' });
          return null;
        }),
        sessionStore.getToken().catch(error => {
          crashReporter.capture(error, { source: 'bootstrap.session' });
          return null;
        }),
      ]);

      if (!mounted) return;
      const isOffline = networkResult?.isInternetReachable === false;
      dispatch(setOffline(isOffline));
      dispatch(setAuthenticated(Boolean(tokenResult)));
      dispatch(setBootstrapped(true));
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

  useEffect(() => {
    const timer = setTimeout(() => {
      registerForPushNotifications();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
