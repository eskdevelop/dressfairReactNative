import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { logoutEverywhere } from '@features/auth/authSync';
import { colors, radii, spacing } from '@app/theme/tokens';
import { HealthDebugPanel } from './HealthDebugPanel';

export function SettingsScreen() {
  const onLogout = () => {
    Alert.alert('Logout', 'Sign out from app and web session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logoutEverywhere();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Settings</Text>
      <View style={{ gap: 10 }}>
        <Text>Notification preferences</Text>
        <Text>Help and support</Text>
        <Text>Privacy policy</Text>
        <Text>Terms and conditions</Text>
        <TouchableOpacity
          onPress={onLogout}
          style={{
            marginTop: spacing.md,
            borderRadius: radii.md,
            borderColor: colors.border,
            borderWidth: 1,
            padding: spacing.md,
          }}
        >
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
        <HealthDebugPanel />
      </View>
    </ScrollView>
  );
}
