import React from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AppRoot } from './src/app/AppRoot';
import { store } from './src/app/store';
import { installObservability } from './src/shared/observability/setup';

// #region agent log
import { debugStartupLog } from './src/shared/observability/__debugStartupLog';
debugStartupLog('App.tsx:JS_START', 'JS_START', {}, 'H1,H3');
// #endregion

// Wire global error / unhandled-promise handlers as early as possible so we
// capture crashes that happen during bootstrap. Register a real transport
// (Sentry, PostHog, your backend) by passing `{ transport }` here.
installObservability();

// Block the native splash screen from auto-hiding the moment JS starts.
// It will be hidden explicitly once the WebView's first page paints
// (see src/features/webview/WebViewScreen.tsx onLoadEnd).
SplashScreen.preventAutoHideAsync()
  .then(() => {
    // #region agent log
    debugStartupLog(
      'App.tsx:preventAutoHideAsync.then',
      'PREVENT_AUTO_HIDE_OK',
      {},
      'H1',
    );
    // #endregion
  })
  .catch((error: unknown) => {
    // #region agent log
    debugStartupLog(
      'App.tsx:preventAutoHideAsync.catch',
      'PREVENT_AUTO_HIDE_FAIL',
      { error: String((error as Error)?.message ?? error) },
      'H1',
    );
    // #endregion
  });

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppRoot />
      </SafeAreaProvider>
    </Provider>
  );
}
