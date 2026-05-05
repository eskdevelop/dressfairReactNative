import React from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AppRoot } from './src/app/AppRoot';
import { store } from './src/app/store';
import { installObservability } from './src/shared/observability/setup';

// Wire global error / unhandled-promise handlers as early as possible so we
// capture crashes that happen during bootstrap. Register a real transport
// (Sentry, PostHog, your backend) by passing `{ transport }` here.
installObservability();

// Block the native splash screen from auto-hiding the moment JS starts.
// It will be hidden explicitly once the WebView's first page paints
// (see src/features/webview/WebViewScreen.tsx onLoadEnd).
SplashScreen.preventAutoHideAsync().catch(() => {
  // Safe to ignore: this can throw if the splash is already hidden,
  // which is fine.
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
