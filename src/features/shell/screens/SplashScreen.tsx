import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppSelector } from '@app/hooks';
import type { RootStackParamList } from '@navigation/types';

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isBootstrapped, isOffline, isMaintenanceMode } = useAppSelector(
    state => state.app,
  );

  React.useEffect(() => {
    if (!isBootstrapped) return;
    if (isMaintenanceMode) {
      navigation.replace('Maintenance');
      return;
    }
    if (isOffline) {
      navigation.replace('Offline');
      return;
    }
    navigation.replace('MainTabs');
  }, [isBootstrapped, isMaintenanceMode, isOffline, navigation]);

  // Render nothing: the native splash (expo-splash-screen) is still on
  // screen at this point and is hidden once the WebView paints its first
  // frame. Returning null prevents an ugly flash of placeholder UI.
  return null;
}


