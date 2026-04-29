import React from 'react';
import { Text, View } from 'react-native';
import * as Network from 'expo-network';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '@shared/ui/AppButton';
import { useAppDispatch } from '@app/hooks';
import { setOffline } from '@app/storeSlices/appSlice';
import type { RootStackParamList } from '@navigation/types';

export function OfflineScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onRetry = async () => {
    const state = await Network.getNetworkStateAsync();
    const offline = !state.isInternetReachable;
    dispatch(setOffline(offline));
    if (!offline) {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ marginBottom: 12, fontSize: 18, fontWeight: '600' }}>
        You are offline
      </Text>
      <Text style={{ marginBottom: 18 }}>Check internet and try again.</Text>
      <View style={{ width: 180 }}>
        <AppButton label="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}
