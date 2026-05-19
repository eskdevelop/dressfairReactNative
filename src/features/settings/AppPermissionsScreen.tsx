import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shouldUseExpoNotifications } from '@features/notifications/expoPushAvailability';
import { colors, spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

const GREEN_HEADING = '#15803D';
const GREEN_ICON_BG = 'rgba(22, 163, 74, 0.15)';
const BODY_GREY = '#616161';

function GreenCircleIcon({ icon }: { icon: keyof typeof Ionicons.glyphMap }): React.ReactElement {
  return (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: GREEN_ICON_BG,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={28} color={GREEN_HEADING} />
    </View>
  );
}

type DeniedTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

function DeniedTile({ icon, title, subtitle }: DeniedTileProps): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.12)',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <Ionicons name={icon} size={20} color="#111827" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#000000' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 4, fontSize: 11.5, color: BODY_GREY, lineHeight: 16 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="ban-outline" size={20} color="#FF5252" style={{ marginTop: 2 }} />
    </View>
  );
}

export function AppPermissionsScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifyGranted, setNotifyGranted] = useState<boolean | null>(null);
  /** True when running in Expo Go (or otherwise must not load `expo-notifications`). */
  const [notifyProbeSkipped, setNotifyProbeSkipped] = useState(false);

  const refreshNotify = useCallback(async () => {
    if (!shouldUseExpoNotifications()) {
      setNotifyProbeSkipped(true);
      setNotifyGranted(null);
      return;
    }
    setNotifyProbeSkipped(false);
    try {
      const Notifications = require('expo-notifications') as typeof import('expo-notifications');
      const settings = await Notifications.getPermissionsAsync();
      const granted = settings.status === 'granted';
      setNotifyGranted(granted);
    } catch {
      setNotifyGranted(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshNotify();
    }, [refreshNotify]),
  );

  const openNotificationTab = (): void => {
    analytics.track('app_permissions_open_notifications_tab');
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Notifications' },
      }),
    );
  };

  const badgeLabel = notifyProbeSkipped
    ? 'N/A'
    : notifyGranted === null
      ? '…'
      : notifyGranted
        ? 'Allowed'
        : 'Not allowed';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
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
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color="#000000" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            marginRight: 22,
            fontSize: 16,
            fontWeight: '600',
            color: '#000000',
          }}
        >
          Permissions
        </Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={{ height: 16 }} />
        <GreenCircleIcon icon="key-outline" />
        <Text
          style={{
            marginTop: 12,
            marginHorizontal: 24,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: '600',
            color: GREEN_HEADING,
            lineHeight: 18,
          }}
        >
          Access certain device features with your permission
        </Text>

        <View style={{ height: 24 }} />

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#000000' }}>
              Notifications
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
                backgroundColor: '#D1D5DB',
              }}
            >
              <Text style={{ fontSize: 11, color: '#111827', fontWeight: '500' }}>{badgeLabel}</Text>
            </View>
          </View>

          <Text style={{ marginTop: 6, fontSize: 14, color: BODY_GREY, lineHeight: 20 }}>
            Enable notifications to get updates on your orders, learn about promotions, etc. You can view
            and edit notifications on the{' '}
            <Text
              onPress={openNotificationTab}
              accessibilityRole="link"
              style={{
                textDecorationLine: 'underline',
                color: GREEN_HEADING,
                fontWeight: '600',
              }}
            >
              notification
            </Text>{' '}
            page.
          </Text>
          {notifyProbeSkipped ? (
            <Text style={{ marginTop: 10, fontSize: 12, color: BODY_GREY, lineHeight: 17 }}>
              System notification permission is not available in the Expo Go app. Use a development or
              preview build to test push on this device.
            </Text>
          ) : null}
        </View>

        <View style={{ height: 28 }} />

        <GreenCircleIcon icon="lock-closed-outline" />
        <Text
          style={{
            marginTop: 12,
            marginHorizontal: 24,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: '700',
            color: GREEN_HEADING,
            lineHeight: 18,
          }}
        >
          We DO NOT access the following device features
        </Text>

        <View style={{ height: 16 }} />

        <DeniedTile icon="mic-outline" title="Microphone" />
        <DeniedTile icon="people-outline" title="Contacts" />
        <DeniedTile icon="bluetooth-outline" title="Bluetooth" />
        <DeniedTile icon="clipboard-outline" title="Clipboard" />
        <DeniedTile
          icon="location-outline"
          title="Location"
          subtitle={
            'In most countries/regions, such as Pakistan, the US, the UK, etc., we do not request access to your location. We only request location access from users in the Middle East to make it easier for users to accurately fill in their shipping address.'
          }
        />
        <DeniedTile
          icon="camera-outline"
          title="Camera"
          subtitle={
            "We do not request permission to access your camera. You can still use the Android system's built-in camera app to take photos for leaving a review, search items, etc., without Dress Fair accessing your camera."
          }
        />
        <DeniedTile
          icon="ellipsis-horizontal"
          title="Others"
          subtitle={
            'In addition to the above device features, we will not request access to any other device features, such as your calendar, reminders, etc.'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
