import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@app/theme/tokens';
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

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.brand, fontSize: 22, fontWeight: '700' }}>
        DressFair
      </Text>
    </View>
  );
}
