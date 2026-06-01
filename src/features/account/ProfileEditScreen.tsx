import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import {
  updateCustomerProfileJson,
  updateCustomerProfileMultipart,
} from '@features/account/customerApi';
import { clearCachedProfile } from '@features/account/customerProfileCache';
import {
  customerAvatarFallbackLetter,
  customerAvatarUri,
} from '@features/account/parseCustomerProfile';
import type { RootStackParamList } from '@navigation/types';
import type { CountryCode } from '@shared/config/env';
import { getEnvConfig } from '@shared/config/env';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

const AVATAR_SIZE = 96;
const H_PADDING = 20;

export function ProfileEditScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProfileEdit'>>();
  const { profile } = route.params;
  const country = useAppSelector(s => s.app.country);
  const cfg = getEnvConfig(country);

  const [first, setFirst] = useState(profile.firstname);
  const [last, setLast] = useState(profile.lastname);
  const [email, setEmail] = useState(profile.email);
  const [mobile, setMobile] = useState(profile.mobile);
  const [saving, setSaving] = useState(false);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(
    null,
  );

  const remoteAvatarUri = useMemo(
    () => customerAvatarUri(profile, cfg.customerAvatarCdnBaseUrl),
    [cfg.customerAvatarCdnBaseUrl, profile],
  );

  const avatarLetter = useMemo(() => customerAvatarFallbackLetter(profile), [profile]);

  const pickProfilePhoto = useCallback(async (): Promise<void> => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photos',
          'Allow photo library access so you can update your profile picture.',
        );
        return;
      }
      // NOTE: `allowsEditing` triggers the native crop UI which fails to
      // present on the iOS Simulator (picker just closes, returns canceled).
      // The avatar already clips to a circle with resizeMode "cover", so we
      // skip the crop step for reliable behaviour on Simulator + real devices.
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]) {
        setPickedAsset(res.assets[0]);
      }
    } catch (e) {
      crashReporter.capture(e, { source: 'ProfileEditScreen.pickProfilePhoto' });
      Alert.alert('Photo picker', 'Something went wrong opening your gallery.');
    }
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const fields = {
        first_name: first.trim(),
        last_name: last.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      };
      const result = pickedAsset
        ? await updateCustomerProfileMultipart(fields, {
            uri: pickedAsset.uri,
            mimeType: pickedAsset.mimeType ?? null,
            fileName: pickedAsset.fileName ?? null,
          })
        : await updateCustomerProfileJson(fields);
      if (!result.success) {
        Alert.alert(
          'Update failed',
          result.message ?? 'Please check your details and try again.',
        );
        return;
      }
      await clearCachedProfile(country as CountryCode);
      Alert.alert('Saved', result.message ?? 'Profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      crashReporter.capture(e, { source: 'ProfileEditScreen.save' });
      Alert.alert('Update failed', 'Please try again.');
    } finally {
      setSaving(false);
    }
  }, [country, email, first, last, mobile, navigation, pickedAsset]);

  const field = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    opts?: { keyboard?: 'default' | 'email-address' | 'phone-pad' },
  ): React.ReactElement => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={{
          color: colors.textMuted,
          marginBottom: 6,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        keyboardType={opts?.keyboard ?? 'default'}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          fontSize: 16,
          color: colors.textPrimary,
          backgroundColor: '#FFFFFF',
        }}
      />
    </View>
  );

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

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: H_PADDING,
          paddingTop: spacing.md,
          paddingBottom: spacing.xl * 2,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={() => void pickProfilePhoto()}
          activeOpacity={0.85}
          style={{ alignSelf: 'center', marginBottom: spacing.xl }}
        >
          <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: '#E5E7EB',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pickedAsset ? (
                <Image
                  source={{ uri: pickedAsset.uri }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : remoteAvatarUri ? (
                <Image
                  source={{ uri: remoteAvatarUri }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: '700',
                    color: colors.textPrimary,
                  }}
                >
                  {avatarLetter}
                </Text>
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="camera" size={18} color="#111827" />
            </View>
          </View>
        </TouchableOpacity>

        {field('First Name', first, setFirst)}
        {field('Last Name', last, setLast)}
        {field('Email', email, setEmail, { keyboard: 'email-address' })}
        {field('WhatsApp Number', mobile, setMobile, { keyboard: 'phone-pad' })}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          <Ionicons name="lock-closed" size={14} color={colors.success} style={{ marginTop: 2 }} />
          <Text
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              fontSize: 12,
              lineHeight: 17,
              color: colors.success,
            }}
          >
            Your information and privacy will be kept secure and uncompromised.
          </Text>
        </View>

        <AppButton label="Save" onPress={() => void save()} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}
