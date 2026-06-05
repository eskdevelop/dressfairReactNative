import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { customerAvatarFallbackLetter } from '../parseCustomerProfile';
import type { CustomerProfile } from '../types';

const AVATAR_SIZE = 56;

type Props = {
  profile: CustomerProfile | null;
  profileLoading?: boolean;
  avatarUri?: string;
  onPressAvatar?: () => void;
  onPressSettings: () => void;
};

export function YouLoggedProfileRow({
  profile,
  profileLoading,
  avatarUri,
  onPressAvatar,
  onPressSettings,
}: Props): React.ReactElement {
  const title =
    `${profile?.firstname ?? ''} ${profile?.lastname ?? ''}`.trim() ||
    profile?.email?.trim() ||
    '';

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          style={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={onPressAvatar ?? undefined}
          disabled={!onPressAvatar}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                overflow: 'hidden',
                backgroundColor: '#E5E7EB',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {profileLoading ? (
                <ActivityIndicator color="#111" />
              ) : avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#111' }}>
                  {customerAvatarFallbackLetter(profile)}
                </Text>
              )}
            </View>
            <Text style={{ marginLeft: 12, flexShrink: 1, fontSize: 16, fontWeight: '600', color: '#000' }} numberOfLines={2}>
              {title || ''}
            </Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={10} onPress={onPressSettings}>
          <Ionicons name="settings-outline" size={24} color="#111" />
        </Pressable>
      </View>
    </View>
  );
}
