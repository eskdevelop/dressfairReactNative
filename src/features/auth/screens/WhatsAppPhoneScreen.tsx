import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';

import { sendWhatsAppOtp } from '../authApi';
import { fullMobileNumber, isValidNationalMobileLength } from '../authTypes';
import {
  AuthBrandHeader,
  AuthLegalFooter,
  AuthPromoStrip,
  AuthToolbar,
} from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { CountryPhoneInput } from '../components/CountryPhoneInput';
import { useStoreMobileRules } from '../useStoreMobileRules';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'WhatsAppPhone'>;

export function WhatsAppPhoneScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const { country, dialCode, nationalLength } = useStoreMobileRules();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onContinue = useCallback(async () => {
    if (!phone.trim()) {
      Alert.alert('', 'Please enter your WhatsApp number.');
      return;
    }
    if (!isValidNationalMobileLength(phone, nationalLength)) {
      Alert.alert('', `Please enter a ${nationalLength}-digit WhatsApp number.`);
      return;
    }
    const fullPhone = fullMobileNumber(country, phone, dialCode);
    setLoading(true);
    try {
      analytics.track('auth_whatsapp_send_tap');
      const result = await sendWhatsAppOtp(fullPhone);
      if (!result.success) {
        Alert.alert('', result.message ?? result.error ?? 'Unable to send verification code.');
        return;
      }
      navigation.replace('OtpVerify', { phone: fullPhone });
    } finally {
      setLoading(false);
    }
  }, [country, dialCode, nationalLength, navigation, phone]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="close" onClose={() => navigation.getParent()?.goBack()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AuthBrandHeader />
        <AuthPromoStrip />
        <CountryPhoneInput
          countryCode={dialCode}
          maxNationalLength={nationalLength}
          value={phone}
          onChangeText={setPhone}
        />
        <View style={{ height: spacing.lg }} />
        <AuthPrimaryButton label="Continue" onPress={() => void onContinue()} loading={loading} />
        <AuthLegalFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
