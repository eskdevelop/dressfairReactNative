import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, radii, spacing } from '@app/theme/tokens';
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
    <View style={{ alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: 1.2,
          color: colors.brand,
        }}
      >
        DRESS FAIR
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: radii.pill,
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
        }}
      >
        <Ionicons name="lock-closed" size={13} color={colors.success} />
        <Text
          style={[
            { marginLeft: 5, fontSize: 11, color: colors.success, fontWeight: '600' },
            androidTextTrim,
          ]}
        >
          All Data is Safeguarded
        </Text>
      </View>
    </View>
  );
}

/** White form card on muted auth pages — wraps brand header + fields. */
export function AuthFormCard({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: spacing.md,
        backgroundColor: '#FFFFFF',
        borderRadius: radii.md,
        overflow: 'hidden',
        paddingBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

/** Vertically centers auth form card in scroll area (login / register). */
export function AuthFormCenterWrap({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingVertical: spacing.lg,
      }}
    >
      {children}
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
    <View style={{ alignItems: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
      <Text style={[{ fontSize: 13, lineHeight: 20, color: colors.textMuted, textAlign: 'center' }, androidTextTrim]}>
        {prefix}{' '}
        <Text
          style={[{ color: colors.brand, fontWeight: '600', fontSize: 13, lineHeight: 20 }, androidTextTrim]}
          onPress={onPress}
          suppressHighlighting
        >
          {linkLabel}
        </Text>
      </Text>
    </View>
  );
}

/** Card-style switch between sign in / register — clearer than inline text link. */
export function AuthSwitchAuthRow({
  message,
  actionLabel,
  onPress,
  actionIcon = 'chevron-forward',
}: {
  message: string;
  actionLabel: string;
  onPress: () => void;
  actionIcon?: React.ComponentProps<typeof Ionicons>['name'];
}): React.ReactElement {
  return (
    <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 11,
          paddingLeft: 14,
          paddingRight: 10,
          backgroundColor: '#FFFFFF',
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.dividerLight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text
          style={[
            {
              flex: 1,
              flexShrink: 1,
              fontSize: 13,
              fontWeight: '500',
              lineHeight: 18,
              color: colors.textSecondary,
              marginRight: spacing.sm,
            },
            androidTextTrim,
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onPress}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            flexShrink: 0,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: radii.pill,
            borderWidth: 1.5,
            borderColor: colors.brand,
            backgroundColor: pressed ? '#FFF7ED' : '#FFFFFF',
            gap: 2,
          })}
        >
          <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 13 }}>{actionLabel}</Text>
          <Ionicons name={actionIcon} size={14} color={colors.brand} style={{ marginTop: 1 }} />
        </Pressable>
      </View>
    </View>
  );
}

/** Title + subtitle — reference-style auth intro (left-aligned, moderate size). */
export function AuthScreenIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): React.ReactElement {
  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.textPrimaryDark,
          lineHeight: 26,
        }}
      >
        {title}
      </Text>
      <Text
        style={[
          {
            marginTop: 6,
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 19,
          },
          androidTextTrim,
        ]}
      >
        {subtitle}
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

/** OTP verify hero — icon, title, destination pill (email / phone). */
export function AuthOtpHero({
  destination,
  title = 'Enter verification code',
  subtitle = 'We sent a code to',
  hint = 'Enter the 5-digit code below',
  icon = 'mail-unread-outline',
  variant = 'default',
}: {
  destination: string;
  title?: string;
  subtitle?: string;
  hint?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'default' | 'whatsapp';
}): React.ReactElement {
  const isWhatsApp = variant === 'whatsapp';
  const iconBg = isWhatsApp ? 'rgba(37, 211, 102, 0.14)' : 'rgba(249, 115, 22, 0.12)';
  const iconColor = isWhatsApp ? '#25D366' : colors.brand;
  const pillBg = isWhatsApp ? '#F0FDF4' : '#FFF7ED';
  const pillBorder = isWhatsApp ? 'rgba(37, 211, 102, 0.28)' : 'rgba(249, 115, 22, 0.22)';
  const pillText = isWhatsApp ? '#15803D' : colors.brand;

  return (
    <View style={{ paddingHorizontal: spacing.lg, alignItems: 'center', paddingTop: spacing.sm }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Ionicons name={icon} size={30} color={iconColor} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: colors.textPrimaryDark,
          textAlign: 'center',
          lineHeight: 28,
        }}
      >
        {title}
      </Text>
      <Text
        style={[
          {
            marginTop: spacing.sm,
            fontSize: 14,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 20,
          },
          androidTextTrim,
        ]}
      >
        {subtitle}
      </Text>
      <View
        style={{
          marginTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: 10,
          backgroundColor: pillBg,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: pillBorder,
          maxWidth: '100%',
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: pillText,
            textAlign: 'center',
            letterSpacing: 0.3,
          }}
          numberOfLines={2}
        >
          {destination}
        </Text>
      </View>
      <Text
        style={[
          {
            marginTop: spacing.md,
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
          },
          androidTextTrim,
        ]}
      >
        {hint}
      </Text>
    </View>
  );
}
