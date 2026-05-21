import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';

import { loginEmailPassword } from '../authApi';
import {
  AuthFormHeader,
  AuthInlineLinkRow,
  AuthLegalFooter,
  AuthToolbar,
} from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { AuthTextField } from '../components/AuthTextField';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'EmailLogin'>;

export function EmailLoginScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onContinue = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      analytics.track('auth_email_login_tap');
      const result = await loginEmailPassword(email.trim(), password);
      if (!result.success) {
        Alert.alert('', result.message ?? 'Login failed.');
        return;
      }
      Alert.alert('', 'Please check your verification code on email.');
      navigation.navigate('EmailOtpVerify', {
        email: email.trim(),
        interimToken: result.token || undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [email, navigation, password]);

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
          <AuthFormHeader />
          <AuthTextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Please Enter your Email"
            keyboardType="email-address"
          />
          <AuthTextField
            label="Password"
            icon="lock-closed-outline"
            secure
            value={password}
            onChangeText={setPassword}
            placeholder="Please Enter your Password"
          />
          <View style={{ marginTop: spacing.sm }}>
            <AuthPrimaryButton label="Continue" onPress={() => void onContinue()} loading={loading} />
          </View>
          <AuthInlineLinkRow
            prefix="Don't Have An Account?"
            linkLabel="Register"
            onPress={() => navigation.navigate('Register')}
          />
          <View style={{ flex: 1, minHeight: 8 }} />
          <AuthLegalFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
