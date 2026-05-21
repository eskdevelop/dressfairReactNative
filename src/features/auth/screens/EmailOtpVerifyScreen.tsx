import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import type { CountryCode } from '@shared/config/env';

import { verifyEmailOtp } from '../authApi';
import { completeNativeLogin } from '../authSession';
import { AuthToolbar } from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { AUTH_OTP_LENGTH, OtpInput } from '../components/OtpInput';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'EmailOtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'EmailOtpVerify'>;

export function EmailOtpVerifyScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = useCallback(async () => {
    if (otp.length < AUTH_OTP_LENGTH) {
      Alert.alert('', `Please enter the ${AUTH_OTP_LENGTH}-digit verification code.`);
      return;
    }
    setLoading(true);
    try {
      analytics.track('auth_email_otp_verify_tap');
      const result = await verifyEmailOtp(email, otp);
      if (!result.success || !result.token) {
        Alert.alert('', result.message ?? 'Verification failed.');
        return;
      }
      const session = await completeNativeLogin(result.token, dispatch, country);
      if (!session.ok) {
        Alert.alert('', session.message);
        return;
      }
      navigation.getParent()?.goBack();
    } finally {
      setLoading(false);
    }
  }, [country, dispatch, email, navigation, otp]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="back" onBack={() => navigation.goBack()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
            Enter The Verification Code
          </Text>
          <Text style={{ marginTop: spacing.md, fontSize: 14, textAlign: 'center' }}>
            A Verification Code Is Sent To
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: '700',
              color: colors.brand,
              textAlign: 'center',
            }}
          >
            {email}
          </Text>
        </View>
        <OtpInput value={otp} onChange={setOtp} />
        <AuthPrimaryButton label="Verify" onPress={() => void onVerify()} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
