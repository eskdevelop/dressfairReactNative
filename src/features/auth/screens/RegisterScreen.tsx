import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import type { CountryCode } from '@shared/config/env';

import { registerAccount } from '../authApi';
import { fullMobileNumber, mobileCodeForCountry } from '../authTypes';
import {
  AuthFormHeader,
  AuthInlineLinkRow,
  AuthLegalFooter,
  AuthToolbar,
} from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { AuthTextField } from '../components/AuthTextField';
import { RegisterMobileInput } from '../components/CountryPhoneInput';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onContinue = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !mobile.trim() || !email.trim() || !password.trim()) {
      Alert.alert('', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      analytics.track('auth_register_tap');
      const result = await registerAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobile: fullMobileNumber(country, mobile),
        password,
      });
      if (!result.success) {
        Alert.alert('', result.message ?? 'Registration failed.');
        return;
      }
      Alert.alert('', 'Registration successful. Please sign in with your email.');
      navigation.replace('EmailLogin');
    } finally {
      setLoading(false);
    }
  }, [country, email, firstName, lastName, mobile, navigation, password]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="back" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <AuthFormHeader showLogo={false} />
          <AuthTextField
            label="First Name"
            icon="person-outline"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            compact
          />
          <AuthTextField
            label="Last Name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            compact
          />
          <RegisterMobileInput
            countryCode={mobileCodeForCountry(country)}
            value={mobile}
            onChangeText={setMobile}
            compact
          />
          <AuthTextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            compact
          />
          <AuthTextField
            label="Password"
            icon="lock-closed-outline"
            secure
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            compact
          />
          <View style={{ marginTop: spacing.xs }}>
            <AuthPrimaryButton label="Continue" onPress={() => void onContinue()} loading={loading} />
          </View>
          <AuthInlineLinkRow
            prefix="Already Have An Account?"
            linkLabel="Login"
            onPress={() => navigation.replace('EmailLogin')}
          />
          <AuthLegalFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
