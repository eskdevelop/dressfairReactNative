import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export type MenuRowProps = {
  icon: IoniconsName;
  label: string;
  hint?: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

export function MenuRow({ icon, label, hint, onPress, destructive, testID }: MenuRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.pill,
          backgroundColor: destructive ? '#FEE2E2' : '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? colors.danger : colors.textPrimary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: destructive ? colors.danger : colors.textPrimary,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>{hint}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export function MenuSectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
      }}
    >
      {title}
    </Text>
  );
}
