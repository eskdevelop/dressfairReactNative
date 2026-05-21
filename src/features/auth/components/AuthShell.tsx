import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const androidTextTrim =
  Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : null;

/** Compact header for form screens — logo + lock badge only (no promo icons). */
export function AuthFormHeader({ showLogo = true }: { showLogo?: boolean } = {}): React.ReactElement {
  if (!showLogo) {
    return <View style={{ height: spacing.xs }} />;
  }

  return (
    <View style={{ alignItems: 'center', paddingTop: 4, paddingBottom: spacing.md }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          letterSpacing: 1,
          color: colors.brand,
        }}
      >
        DRESS FAIR
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Ionicons name="lock-closed" size={13} color={colors.success} />
        <Text
          style={[
            { marginLeft: 4, fontSize: 11, color: colors.success, fontWeight: '600' },
            androidTextTrim,
          ]}
        >
          All Data is Safeguarded
        </Text>
      </View>
    </View>
  );
}

/** Inline tappable link on one baseline — avoids Pressable-inside-Text misalignment. */
export function AuthInlineLinkRow({
  prefix,
  linkLabel,
  onPress,
}: {
  prefix: string;
  linkLabel: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', marginTop: spacing.md, paddingHorizontal: spacing.lg }}>
      <Text style={[{ fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center' }, androidTextTrim]}>
        {prefix}{' '}
        <Text
          style={[{ color: colors.brand, fontWeight: '700', fontSize: 14, lineHeight: 20 }, androidTextTrim]}
          onPress={onPress}
          suppressHighlighting
        >
          {linkLabel}
        </Text>
      </Text>
    </View>
  );
}

export function AuthLegalFooter(): React.ReactElement {
  const navigation = useNavigation<RootNav>();

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, alignItems: 'center' }}>
      <Text
        style={[
          { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
          androidTextTrim,
        ]}
      >
        By continuing, you agree to our{' '}
        <Text
          style={{ color: colors.brand, fontWeight: '600' }}
          onPress={() => navigation.navigate('Terms')}
          suppressHighlighting
        >
          Term of Use
        </Text>{' '}
        and{' '}
        <Text
          style={{ color: colors.brand, fontWeight: '600' }}
          onPress={() => navigation.navigate('Privacy')}
          suppressHighlighting
        >
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
}

export function AuthPromoStrip(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <PromoColumn icon="car-outline" title="Free shipping" subtitle="On All Orders" />
      <PromoColumn icon="return-down-back-outline" title="Free returns" subtitle="up to 90 days" />
    </View>
  );
}

function PromoColumn({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
}): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', maxWidth: 140 }}>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#EEEEEE',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text style={{ marginTop: 8, fontWeight: '700', fontSize: 14, color: colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ marginTop: 2, fontSize: 12, color: '#757575', textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}

export function AuthBrandHeader(): React.ReactElement {
  return (
    <View style={{ alignItems: 'center', paddingTop: spacing.md }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: 1,
          color: colors.brand,
        }}
      >
        DRESS FAIR
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Ionicons name="lock-closed" size={14} color={colors.success} />
        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.success, fontWeight: '600' }}>
          All Data is Safeguarded
        </Text>
      </View>
    </View>
  );
}

export function AuthToolbar({
  mode,
  onClose,
  onBack,
}: {
  mode: 'close' | 'back';
  onClose?: () => void;
  onBack?: () => void;
}): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={mode === 'close' ? 'Close' : 'Back'}
        onPress={mode === 'close' ? onClose : onBack}
        hitSlop={12}
      >
        <Ionicons name={mode === 'close' ? 'close' : 'chevron-back'} size={28} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}
