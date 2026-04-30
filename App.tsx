import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AppRoot } from './src/app/AppRoot';
import { store } from './src/app/store';

export default function App(){
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
        <AppRoot />
      </SafeAreaProvider>
    </Provider>
  );
}
