import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  loadCachedProfile,
  saveCachedProfile,
} from '@features/account/customerProfileCache';
import { customerAvatarFallbackLetter, customerAvatarUri } from '@features/account/parseCustomerProfile';
import type { CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { openWebPath } from '@navigation/navigationRef';
import type { CountryCode } from '@shared/config/env';
import { getEnvConfig } from '@shared/config/env';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

const AVATAR_SIZE = 66;

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

  const displayName = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstname} ${profile.lastname}`.trim();
  }, [profile]);

  const load = useCallback(async () => {
    const cached = await loadCachedProfile(country as CountryCode);
    if (cached) {
      setProfile(cached);
    }
    const showBlockingSpinner = !cached;
    if (showBlockingSpinner) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    setError(null);
    try {
      const result = await fetchCustomerProfile();
      if (result.ok) {
        setProfile(result.profile);
        await saveCachedProfile(country as CountryCode, result.profile);
      } else if (!cached) {
        setProfile(null);
        setError(result.message ?? 'Unable to load profile.');
      }
    } catch (e) {
      crashReporter.capture(e, { source: 'ProfileScreen.load' });
      if (!cached) {
        setProfile(null);
        setError('Unable to load profile. Please try again.');
      }
    } finally {
      if (showBlockingSpinner) {
        setLoading(false);
      }
    }
  }, [country]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onEdit = (): void => {
    if (!profile) return;
    navigation.navigate('ProfileEdit', { profile });
  };

  const onReviewsPlaceholder = (): void => {
    Alert.alert(
      'Reviews',
      'Product reviews are not available in the app yet. Check back soon.',
    );
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

      {loading && !profile ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : error && !profile ? (
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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.sm,
            paddingBottom: spacing.xl,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            }}
          >
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: '#D1D5DB',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }}>
                  {customerAvatarFallbackLetter(profile)}
                </Text>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: spacing.sm, paddingLeft: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  paddingLeft: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: colors.textPrimary,
                    flexShrink: 1,
                  }}
                  numberOfLines={2}
                >
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={onEdit}
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile"
                  hitSlop={10}
                  style={{ marginLeft: 4, paddingBottom: 4 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.brand} />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: spacing.xs,
                  paddingLeft: spacing.sm,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    0
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    Total reviews
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: colors.border,
                    marginHorizontal: spacing.lg,
                    marginTop: 4,
                  }}
                />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    0
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Helpful</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: spacing.sm }} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingHorizontal: spacing.md,
              paddingLeft: spacing.sm + 4,
            }}
          >
            <Ionicons name="lock-closed" size={14} color={colors.success} style={{ marginTop: 2 }} />
            <Text
              style={{
                flex: 1,
                marginLeft: spacing.xs + 2,
                fontSize: 11,
                color: colors.success,
                lineHeight: 15,
              }}
            >
              Your information and privacy will be kept secure and uncompromised.
            </Text>
          </View>

          <View style={{ height: spacing.sm }} />

          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: spacing.sm }} />

          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 280,
              paddingHorizontal: spacing.xl,
            }}
          >
            <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />

            <Text
              style={{
                marginTop: spacing.lg,
                fontSize: 13,
                fontWeight: '500',
                color: colors.textPrimary,
              }}
            >
              Review is empty
            </Text>

            <Text
              style={{
                marginTop: spacing.sm,
                fontSize: 12,
                color: colors.textMuted,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              You have no completed reviews or the reviews have been deleted.
            </Text>

            <TouchableOpacity
              onPress={onReviewsPlaceholder}
              accessibilityRole="button"
              style={{
                marginTop: spacing.lg + spacing.xs,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.sm + 2,
                borderRadius: 20,
                backgroundColor: colors.brand,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                Go to your reviews
              </Text>
            </TouchableOpacity>
          </View>
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
