import React from 'react';
import { Text, View } from 'react-native';

export function MaintenanceScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
        Maintenance in progress
      </Text>
      <Text>We are improving DressFair. Please check again shortly.</Text>
    </View>
  );
}
