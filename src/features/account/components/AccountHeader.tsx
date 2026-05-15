import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomerProfile } from '@features/account/types';
import { colors, spacing } from '@app/theme/tokens';

function initials(profile: Pick<CustomerProfile, 'firstname' | 'lastname'>): string {
  const a = profile.firstname?.trim()?.charAt(0) ?? '';
  const b = profile.lastname?.trim()?.charAt(0) ?? '';
  const s = `${a}${b}`.toUpperCase();
  return s.length > 0 ? s : '?';
}

type Props = {
  variant: 'guest' | 'user';
  profile: CustomerProfile | null;
  profileLoading?: boolean;
  avatarUri?: string | undefined;
  /** Pre-formatted line under name (wallet / loyalty) — optional when logged in */
  creditsLine?: string | undefined;
  onPressGuestCta: () => void;
  onPressSettings: () => void;
  onPressAvatarLoggedIn?: () => void;
};

export function AccountHeader({
  variant,
  profile,
  profileLoading,
  avatarUri,
  creditsLine,
  onPressGuestCta,
  onPressSettings,
  onPressAvatarLoggedIn,
}: Props) {
  const insets = useSafeAreaInsets();
  const displayName =
    profile && (profile.firstname || profile.lastname)
      ? `${profile.firstname} ${profile.lastname}`.trim()
      : profile?.email ?? (variant === 'user' ? 'Welcome' : 'Account');

  return (
    <View style={{ backgroundColor: colors.brand, paddingBottom: spacing.md + 2 }}>
      <View style={{ paddingTop: insets.top + spacing.sm + 2, paddingHorizontal: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {variant === 'guest' ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onPressGuestCta}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}
            >
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-outline" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>
                  Sign in / Register
                </Text>
                <Text style={{ marginTop: 6, fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.92)' }}>
                  Sign in for the best experience
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              disabled={!onPressAvatarLoggedIn}
              onPress={onPressAvatarLoggedIn}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profileLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 18 }}>
                    {profile ? initials(profile) : '?'}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {profile?.mobile ? (
                  <Text style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.92)' }}>
                    +{profile.mobile}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onPressSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={12}
          >
            <Ionicons name="settings-outline" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>
        {variant === 'user' && creditsLine ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Ionicons name="wallet-outline" size={20} color="#FFF" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>{creditsLine}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
