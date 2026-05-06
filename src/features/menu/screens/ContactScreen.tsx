import React from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import {
  contactChannels,
  contactCompany,
  contactHeadline,
  contactHours,
} from '@features/menu/content/contact';
import type { ContactChannel } from '@features/menu/content/contact';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const channelIcon = (label: string): IoniconsName => {
  const lower = label.toLowerCase();
  if (lower.includes('whatsapp')) return 'logo-whatsapp';
  if (lower.includes('email')) return 'mail-outline';
  if (lower.includes('call')) return 'call-outline';
  return 'chatbubble-ellipses-outline';
};

function ChannelTile({ channel }: { channel: ContactChannel }) {
  const onPress = async () => {
    analytics.track('contact_channel_pressed', { label: channel.label });
    try {
      const supported = await Linking.canOpenURL(channel.url);
      if (!supported) {
        Alert.alert(
          'Unable to open',
          `Please ${channel.label.toLowerCase()} us at ${channel.display}.`,
        );
        return;
      }
      await Linking.openURL(channel.url);
    } catch (error) {
      crashReporter.capture(error, {
        source: 'ContactScreen.ChannelTile',
        label: channel.label,
      });
      Alert.alert(
        'Something went wrong',
        `Please ${channel.label.toLowerCase()} us at ${channel.display}.`,
      );
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${channel.label} ${channel.display}`}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        marginBottom: spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.pill,
          backgroundColor: '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={channelIcon(channel.label)}
          size={20}
          color={colors.textPrimary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          {channel.label}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontWeight: '600',
            marginTop: 2,
          }}
        >
          {channel.display}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export function ContactScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: spacing.sm }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
            marginLeft: spacing.sm,
          }}
        >
          Contact Us
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            lineHeight: 22,
            marginBottom: spacing.lg,
          }}
        >
          {contactHeadline}
        </Text>

        {contactChannels.map(channel => (
          <ChannelTile key={channel.label} channel={channel} />
        ))}

        <View
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            backgroundColor: '#F9FAFB',
            borderRadius: radii.md,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {contactHours.title}
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              marginTop: spacing.xs,
              fontWeight: '600',
            }}
          >
            {contactHours.detail}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
            {contactCompany.name}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              marginTop: spacing.xs,
              fontSize: 12,
            }}
          >
            {contactCompany.location}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
