import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { colors, radii, spacing } from '@app/theme/tokens';

import { AppButton } from './AppButton';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryLoading?: boolean;
};

type ErrorPresentation = {
  icon: IonName;
  title: string;
  subtitle: string;
};

function presentationForMessage(message: string): ErrorPresentation {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes('storefront needs a refresh') || normalized.includes('client-side exception')) {
    return {
      icon: 'refresh-circle-outline',
      title: "Couldn't load the store",
      subtitle: 'Something went wrong while loading Dress Fair. Reload to fetch a fresh copy.',
    };
  }

  if (normalized.includes('too long')) {
    return {
      icon: 'time-outline',
      title: 'Taking longer than usual',
      subtitle: 'The page is slow to respond. Check your connection and try again.',
    };
  }

  if (normalized.includes('unable to load')) {
    return {
      icon: 'cloud-offline-outline',
      title: 'Unable to reach Dress Fair',
      subtitle: 'We could not open the storefront. Please check your internet and retry.',
    };
  }

  return {
    icon: 'alert-circle-outline',
    title: 'Something went wrong',
    subtitle: message,
  };
}

export function AppErrorView({ message, onRetry, retryLabel = 'Reload', retryLoading }: Props) {
  const { icon, title, subtitle } = presentationForMessage(message);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.pageMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Ionicons name={icon} size={36} color={colors.brand} />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 20,
          color: colors.textMuted,
          textAlign: 'center',
          maxWidth: 300,
          marginBottom: spacing.xl,
        }}
      >
        {subtitle}
      </Text>

      {onRetry ? (
        <View style={{ width: '100%', maxWidth: 240 }}>
          <AppButton label={retryLabel} onPress={onRetry} loading={retryLoading} />
        </View>
      ) : null}

      <View
        style={{
          marginTop: spacing.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radii.md,
          backgroundColor: colors.pageMuted,
        }}
      >
        <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center' }}>
          Tip: Reload clears cached storefront data and opens a fresh page.
        </Text>
      </View>
    </View>
  );
}
