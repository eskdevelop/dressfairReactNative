import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isGuest: boolean;
  onSettings: () => void;
  onYourOrders: () => void;
  onAddresses: () => void;
  onGuestRestriction: () => void;
};

/** Flat ListTile parity for Flutter `you_screen.dart` list rows. */
export function YouFlutterListTiles({
  isGuest,
  onSettings,
  onYourOrders,
  onAddresses,
  onGuestRestriction,
}: Props): React.ReactElement {
  return (
    <View>
      {isGuest ? (
        <>
          <TileRow icon="settings-outline" label="Settings" onPress={onSettings} />
          <Divider />
        </>
      ) : null}

      <TileRow
        icon="list-outline"
        label="Your orders"
        onPress={() => {
          if (isGuest) onGuestRestriction();
          else onYourOrders();
        }}
      />
      <Divider />

      <TileRow
        icon="location-outline"
        label="Addresses"
        onPress={() => {
          if (isGuest) onGuestRestriction();
          else onAddresses();
        }}
      />
      <Divider />
    </View>
  );
}

function Divider(): React.ReactElement {
  return <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.12)' }} />;
}

function TileRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
        <Ionicons name={icon} size={22} color="#111" style={{ marginRight: 14 }} />
        <Text style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#111' }}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </Pressable>
  );
}
