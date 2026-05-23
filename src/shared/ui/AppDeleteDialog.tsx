import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

export type AppDeleteDialogProps = {
  visible: boolean;
  /** Centered body copy (Flutter `delete_dialog.dart` parity). */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Dress Fair delete / remove confirmation — orange primary + outlined cancel.
 * Matches Flutter `showDeleteAddressDialog` and `AddressListScreen` modal.
 */
export function AppDeleteDialog({
  visible,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: AppDeleteDialogProps): React.ReactElement {
  const disabled = loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => (disabled ? undefined : onCancel())}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: radii.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.textPrimaryDark,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: spacing.xl,
            }}
          >
            {message}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onConfirm}
            style={{
              backgroundColor: colors.brand,
              borderRadius: radii.pill,
              paddingVertical: 13,
              marginBottom: spacing.sm,
              opacity: disabled ? 0.75 : 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {confirmLabel}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={disabled}
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
        </View>
      </View>
    </Modal>
  );
}
