import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import { updateCustomerProfileJson } from '@features/account/customerApi';
import type { RootStackParamList } from '@navigation/types';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

export function ProfileEditScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProfileEdit'>>();
  const { profile } = route.params;

  const [first, setFirst] = useState(profile.firstname);
  const [last, setLast] = useState(profile.lastname);
  const [email, setEmail] = useState(profile.email);
  const [mobile, setMobile] = useState(profile.mobile);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const result = await updateCustomerProfileJson({
        first_name: first.trim(),
        last_name: last.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      });
      if (!result.success) {
        Alert.alert(
          'Update failed',
          result.message ?? 'Please check your details and try again.',
        );
        return;
      }
      Alert.alert('Saved', result.message ?? 'Profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      crashReporter.capture(e, { source: 'ProfileEditScreen.save' });
      Alert.alert('Update failed', 'Please try again.');
    } finally {
      setSaving(false);
    }
  }, [email, first, last, mobile, navigation]);

  const field = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    opts?: { keyboard?: 'default' | 'email-address' | 'phone-pad' },
  ): React.ReactElement => (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>
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
          paddingVertical: spacing.sm,
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
          Edit profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {field('First name', first, setFirst)}
        {field('Last name', last, setLast)}
        {field('Email', email, setEmail, { keyboard: 'email-address' })}
        {field('Mobile', mobile, setMobile, { keyboard: 'phone-pad' })}
        <View style={{ height: spacing.md }} />
        <AppButton label="Save changes" onPress={() => void save()} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}
