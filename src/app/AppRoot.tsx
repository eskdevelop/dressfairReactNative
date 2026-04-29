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
import { perf } from '@shared/observability/performance';
import { setAuthenticated, setBootstrapped, setOffline } from './storeSlices/appSlice';

export function AppRoot() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    perf.start('app_bootstrap');
    const bootstrap = async () => {
      try {
        const [networkState, token] = await Promise.all([
          Network.getNetworkStateAsync(),
          sessionStore.getToken(),
        ]);
        if (!mounted) return;
        dispatch(setOffline(!networkState.isInternetReachable));
        dispatch(setAuthenticated(Boolean(token)));
      } catch {
        if (!mounted) return;
        dispatch(setOffline(false));
        dispatch(setAuthenticated(false));
      } finally {
        if (!mounted) return;
        dispatch(setBootstrapped(true));
        const elapsed = perf.end('app_bootstrap');
        if (elapsed !== null) {
          analytics.track('app_bootstrap_complete', { elapsedMs: elapsed });
        }
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
