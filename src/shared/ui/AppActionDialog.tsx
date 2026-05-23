import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

export type AppActionDialogProps = {
  visible: boolean;
  message: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Branded confirmation / action dialog — orange primary + outlined cancel.
 * Use instead of system Alert for checkout gates and similar flows.
 */
export function AppActionDialog({
  visible,
  message,
  title,
  icon = 'information-circle-outline',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  hideCancel = false,
  onConfirm,
  onCancel,
}: AppActionDialogProps): React.ReactElement {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.52)',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: radii.lg,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={icon} size={26} color={colors.brand} />
            </View>
          </View>

          {title ? (
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: colors.textPrimaryDark,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: spacing.sm,
              }}
            >
              {title}
            </Text>
          ) : null}

          <Text
            style={{
              fontSize: 15,
              fontWeight: '400',
              color: 'rgba(34, 34, 34, 0.78)',
              textAlign: 'center',
              lineHeight: 21,
              marginBottom: spacing.xl,
            }}
          >
            {message}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            style={{
              backgroundColor: colors.brand,
              borderRadius: radii.pill,
              paddingVertical: 13,
              marginBottom: hideCancel ? 0 : spacing.sm,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{confirmLabel}</Text>
          </Pressable>

          {!hideCancel ? (
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: radii.pill,
                paddingVertical: 13,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
              }}
            >
              <Text style={{ color: colors.textPrimaryDark, fontSize: 15, fontWeight: '500' }}>
                {cancelLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
