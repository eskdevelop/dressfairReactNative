import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { colors, spacing } from '@app/theme/tokens';
import type { CountryCode } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { AppActionDialog } from '@shared/ui/AppActionDialog';

import { loginEmailPassword } from '../authApi';
import { completeNativeLogin } from '../authSession';
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
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'EmailLogin'>;

type EmailLoginDialog = {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  confirmLabel: string;
  hideCancel?: boolean;
  onConfirm: () => void;
};

export function EmailLoginScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<EmailLoginDialog | null>(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const onContinue = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setDialog({
        title: 'Missing details',
        message: 'Please enter your email and password to continue.',
        icon: 'mail-outline',
        confirmLabel: 'Got it',
        hideCancel: true,
        onConfirm: closeDialog,
      });
      return;
    }
    setLoading(true);
    try {
      analytics.track('auth_email_login_tap');
      const result = await loginEmailPassword(email.trim(), password);
      if (!result.success) {
        setDialog({
          title: 'Login failed',
          message: result.message ?? 'We could not sign you in. Please check your details and try again.',
          icon: 'alert-circle-outline',
          confirmLabel: 'Try again',
          hideCancel: true,
          onConfirm: closeDialog,
        });
        return;
      }
      if (!result.token) {
        setDialog({
          title: 'Sign in failed',
          message: 'Login response did not include a valid session token.',
          icon: 'alert-circle-outline',
          confirmLabel: 'Try again',
          hideCancel: true,
          onConfirm: closeDialog,
        });
        return;
      }
      const session = await completeNativeLogin(result.token, dispatch, country);
      if (!session.ok) {
        setDialog({
          title: 'Sign in failed',
          message: session.message,
          icon: 'alert-circle-outline',
          confirmLabel: 'OK',
          hideCancel: true,
          onConfirm: closeDialog,
        });
        return;
      }
      navigation.getParent()?.goBack();

      // Archived email OTP flow (re-enable after store approval + AuthNavigator route):
      // setDialog({
      //   title: 'Check your email',
      //   message: 'We sent a verification code to your email. Enter it on the next screen to finish signing in.',
      //   icon: 'mail-unread-outline',
      //   confirmLabel: 'Enter code',
      //   hideCancel: true,
      //   onConfirm: () => {
      //     closeDialog();
      //     navigation.navigate('EmailOtpVerify', {
      //       email: email.trim(),
      //       interimToken: result.token || undefined,
      //     });
      //   },
      // });
    } finally {
      setLoading(false);
    }
  }, [closeDialog, country, dispatch, email, navigation, password]);

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
              title="Log in"
              subtitle="Enter your email and password to securely access your account."
            />
            <AuthTextField
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              hideLabel
              filled
            />
            <AuthTextField
              icon="lock-closed-outline"
              secure
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              hideLabel
              filled
            />
            <View style={{ marginTop: spacing.md }}>
              <AuthPrimaryButton label="Login" onPress={() => void onContinue()} loading={loading} />
            </View>
            <AuthInlineLinkRow
              prefix="Don't have an account?"
              linkLabel="Sign up here"
              onPress={() => navigation.navigate('Register')}
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
