import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { fetchCustomerProfile } from '@features/account/customerApi';
import {
  customerAvatarUri,
} from '@features/account/parseCustomerProfile';
import type { CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { openWebPath } from '@navigation/navigationRef';
import { getEnvConfig } from '@shared/config/env';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const country = useAppSelector(state => state.app.country);
  const cfg = getEnvConfig(country);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = useMemo(
    () => (profile ? customerAvatarUri(profile, cfg.customerAvatarCdnBaseUrl) : undefined),
    [cfg.customerAvatarCdnBaseUrl, profile],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCustomerProfile();
      if (!result.ok) {
        setProfile(null);
        setError(result.message ?? 'Unable to load profile.');
        return;
      }
      setProfile(result.profile);
    } catch (e) {
      crashReporter.capture(e, { source: 'ProfileScreen.load' });
      setError('Unable to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onEdit = (): void => {
    if (!profile) return;
    navigation.navigate('ProfileEdit', { profile });
  };

  const onSignIn = (): void => {
    openWebPath('/');
  };

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
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            marginRight: 24,
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          Profile
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : error ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: colors.textPrimary, marginBottom: spacing.md }}>{error}</Text>
          <AppButton label="Retry" onPress={() => void load()} />
          <View style={{ height: spacing.md }} />
          <TouchableOpacity
            onPress={onSignIn}
            accessibilityRole="button"
            style={{
              paddingVertical: spacing.md,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Sign in on website</Text>
          </TouchableOpacity>
        </View>
      ) : profile ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#E5E7EB',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
                  {profile.firstname.charAt(0).toUpperCase() || '?'}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                {`${profile.firstname} ${profile.lastname}`.trim()}
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>{profile.email}</Text>
              <Text style={{ color: colors.textMuted }}>{profile.mobile}</Text>
            </View>
          </View>

          <View style={{ height: spacing.lg }} />
          <AppButton label="Edit profile" onPress={onEdit} />
        </ScrollView>
      ) : (
        <View style={{ padding: spacing.lg }}>
          <TouchableOpacity
            onPress={onSignIn}
            accessibilityRole="button"
            style={{
              paddingVertical: spacing.md,
              borderRadius: 24,
              backgroundColor: colors.brand,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>Sign in on website</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
