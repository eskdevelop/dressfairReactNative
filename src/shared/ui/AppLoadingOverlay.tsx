import React from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  visible: boolean;
  message?: string;
};

/**
 * Full-screen blocking overlay shown while a short async flow finishes (e.g.
 * post-login session bootstrap + profile fetch). Keeps the user on the current
 * screen with a clear "in progress" cue so they do not close the app or tap
 * away during the few seconds of network work.
 */
export function AppLoadingOverlay({ visible, message }: Props): React.ReactElement {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            minWidth: 200,
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: radii.lg,
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.xl,
          }}
        >
          <ActivityIndicator size="large" color={colors.brand} />
          {message ? (
            <Text
              style={{
                marginTop: spacing.md,
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
