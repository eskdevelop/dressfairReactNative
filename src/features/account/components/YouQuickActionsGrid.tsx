import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';

type Action = {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
};

type Props = {
  onHistory: () => void;
  onAddresses: () => void;
  onNotifications: () => void;
  onFavourite: () => void;
  unreadCount?: number;
};

export function YouQuickActionsGrid({
  onHistory,
  onAddresses,
  onNotifications,
  onFavourite,
  unreadCount = 0,
}: Props): React.ReactElement {
  const actions: Action[] = [
    { key: 'history', icon: 'time-outline', label: 'History', onPress: onHistory },
    { key: 'addresses', icon: 'location-outline', label: 'Addresses', onPress: onAddresses },
    {
      key: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: onNotifications,
      badge: unreadCount,
    },
    { key: 'favourite', icon: 'heart-outline', label: 'Favourite', onPress: onFavourite },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md,
        justifyContent: 'space-between',
      }}
    >
      {actions.map(action => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ position: 'relative', marginBottom: 6 }}>
            <Ionicons name={action.icon} size={22} color={colors.textPrimary} />
            {action.badge != null && action.badge > 0 ? (
              <View pointerEvents="none" style={styles.badge}>
                <Text style={styles.badgeText}>
                  {action.badge > 99 ? '99+' : action.badge}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 15,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFF',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 10,
  },
  label: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
});
