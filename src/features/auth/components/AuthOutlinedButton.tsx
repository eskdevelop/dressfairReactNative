import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing } from '@app/theme/tokens';

type Props = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  onPress: () => void;
};

export function AuthOutlinedButton({
  label,
  icon,
  iconColor = colors.textPrimary,
  onPress,
}: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Ionicons name={icon} size={22} color={iconColor} style={{ marginRight: 10 }} />
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

// Official Google "G" mark. Bundled as a PNG asset and rendered via <Image>
// to get the authentic multi-colour logo without pulling in a native SVG
// dependency (which would require a dev-client rebuild).
const GOOGLE_G_LOGO = require('../../../../assets/google-g-logo.png');

function GoogleGIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <Image
      source={GOOGLE_G_LOGO}
      style={{ width: size, height: size, marginRight: 10 }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

/** Google brand button with the official multi-colour "G" mark. */
export function AuthGoogleButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
      }}
    >
      <GoogleGIcon size={20} />
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

/** WhatsApp brand green icon wrapper for chooser button */
export function AuthWhatsAppButton({ onPress }: { onPress: () => void }): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#25D366',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
        Continue with Whatsapp
      </Text>
    </Pressable>
  );
}
