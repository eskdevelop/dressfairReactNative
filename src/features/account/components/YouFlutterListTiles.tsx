import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@app/theme/tokens';

type Props = {
  isGuest: boolean;
  unreadCount?: number;
  onSettings: () => void;
  onYourOrders: () => void;
  onMessages: () => void;
  onReviews: () => void;
  onGuestRestriction: () => void;
};

/** Flat ListTile parity for Flutter `you_screen.dart` list rows. */
export function YouFlutterListTiles({
  isGuest,
  unreadCount = 0,
  onSettings,
  onYourOrders,
  onMessages,
  onReviews,
  onGuestRestriction,
}: Props): React.ReactElement {
  const guard = (action: () => void) => {
    if (isGuest) onGuestRestriction();
    else action();
  };

  return (
    <View>
      {isGuest ? (
        <>
          <TileRow icon="settings-outline" label="Settings" onPress={onSettings} />
          <Divider />
        </>
      ) : null}

      <TileRow icon="list-outline" label="Your orders" onPress={() => guard(onYourOrders)} />
      <Divider />

      <TileRow
        icon="chatbubble-ellipses-outline"
        label="Messages"
        badge={isGuest ? undefined : unreadCount}
        onPress={() => guard(onMessages)}
      />
      <Divider />

      <TileRow icon="star-outline" label="Reviews" onPress={() => guard(onReviews)} />
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
  badge,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  badge?: number;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 }}>
        <Ionicons name={icon} size={20} color="#111" style={{ marginRight: 14 }} />
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '400', color: '#111' }}>{label}</Text>
        {badge != null && badge > 0 ? (
          <View pointerEvents="none" style={styles.rowBadge}>
            <Text style={styles.rowBadgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={20} color="#6B7280" style={{ marginLeft: badge != null && badge > 0 ? 8 : 0 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 12,
  },
});
