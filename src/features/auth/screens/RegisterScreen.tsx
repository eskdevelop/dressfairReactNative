import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import { AppActionDialog } from '@shared/ui/AppActionDialog';

import { registerAccount } from '../authApi';
import { fullMobileNumber, isValidNationalMobileLength } from '../authTypes';
import {
  AuthFormCard,
  AuthFormCenterWrap,
  AuthFormHeader,
  AuthInlineLinkRow,
  AuthLegalFooter,
  AuthScreenIntro,
  AuthToolbar,
} from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { AuthTextField } from '../components/AuthTextField';
import { RegisterMobileInput } from '../components/CountryPhoneInput';
import { useStoreMobileRules } from '../useStoreMobileRules';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type RegisterDialog = {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  confirmLabel: string;
  hideCancel?: boolean;
  onConfirm: () => void;
};

export function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const { country, dialCode, nationalLength } = useStoreMobileRules();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<RegisterDialog | null>(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const onContinue = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !mobile.trim() || !email.trim() || !password.trim()) {
      setDialog({
        title: 'Complete all fields',
        message: 'Please fill in all fields to continue.',
        icon: 'create-outline',
        confirmLabel: 'Got it',
        hideCancel: true,
        onConfirm: closeDialog,
      });
      return;
    }
    if (!isValidNationalMobileLength(mobile, nationalLength)) {
      setDialog({
        title: 'Invalid mobile number',
        message: `Please enter a ${nationalLength}-digit mobile number.`,
        icon: 'call-outline',
        confirmLabel: 'Got it',
        hideCancel: true,
        onConfirm: closeDialog,
      });
      return;
    }
    setLoading(true);
    try {
      analytics.track('auth_register_tap');
      const result = await registerAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobile: fullMobileNumber(country, mobile, dialCode),
        password,
      });
      if (!result.success) {
        setDialog({
          title: 'Registration failed',
          message: result.message ?? 'Registration failed.',
          icon: 'alert-circle-outline',
          confirmLabel: 'Try again',
          hideCancel: true,
          onConfirm: closeDialog,
        });
        return;
      }
      setDialog({
        title: 'Registration successful',
        message: 'Please sign in with your email.',
        icon: 'checkmark-circle-outline',
        confirmLabel: 'Sign in',
        hideCancel: true,
        onConfirm: () => {
          closeDialog();
          navigation.replace('EmailLogin');
        },
      });
    } finally {
      setLoading(false);
    }
  }, [closeDialog, country, dialCode, email, firstName, lastName, mobile, nationalLength, navigation, password]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageMuted }} edges={['top', 'bottom']}>
      <AuthToolbar mode="back" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <AuthFormCenterWrap>
            <AuthFormCard>
            <AuthFormHeader />
            <View
              style={{
                height: 1,
                backgroundColor: colors.dividerLight,
                marginHorizontal: spacing.lg,
                marginBottom: spacing.xs,
              }}
            />
            <AuthScreenIntro
              title="Create Account"
              subtitle="Create a new account to get started and enjoy seamless access to our features."
            />
            <AuthTextField
              icon="person-outline"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              autoCapitalize="words"
              hideLabel
              filled
              compact
            />
            <AuthTextField
              icon="person-outline"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              autoCapitalize="words"
              hideLabel
              filled
              compact
            />
            <RegisterMobileInput
              countryCode={dialCode}
              maxNationalLength={nationalLength}
              value={mobile}
              onChangeText={setMobile}
              compact
              hideLabel
              filled
            />
            <AuthTextField
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              hideLabel
              filled
              compact
            />
            <AuthTextField
              icon="lock-closed-outline"
              secure
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              hideLabel
              filled
              compact
            />
            <View style={{ marginTop: spacing.md }}>
              <AuthPrimaryButton label="Create Account" onPress={() => void onContinue()} loading={loading} />
            </View>
            <AuthInlineLinkRow
              prefix="Already have an account?"
              linkLabel="Sign in here"
              onPress={() => navigation.replace('EmailLogin')}
            />
            </AuthFormCard>
          </AuthFormCenterWrap>
          <AuthLegalFooter />
        </ScrollView>
      </KeyboardAvoidingView>

      <AppActionDialog
        visible={dialog != null}
        title={dialog?.title}
        message={dialog?.message ?? ''}
        icon={dialog?.icon}
        confirmLabel={dialog?.confirmLabel}
        hideCancel={dialog?.hideCancel}
        onConfirm={() => dialog?.onConfirm()}
        onCancel={closeDialog}
      />
    </SafeAreaView>
  );
}
