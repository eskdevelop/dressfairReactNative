import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IoniconsName;
  label: string;
  hint?: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
  showDividerBelow?: boolean;
};

export function AccountMenuRow({
  icon,
  label,
  hint,
  onPress,
  destructive,
  testID,
  showDividerBelow = true,
}: Props) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        testID={testID}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
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
            size={17}
            color={destructive ? colors.danger : colors.textPrimaryDark}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: destructive ? colors.danger : colors.textPrimaryDark,
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {label}
          </Text>
          {hint ? (
            <Text style={{ color: colors.textSecondary, marginTop: 2, fontSize: 12 }}>
              {hint}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
      </TouchableOpacity>
      {showDividerBelow ? (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.dividerLight,
            marginLeft: spacing.md + 36 + spacing.md,
          }}
        />
      ) : null}
    </>
  );
}
