import React, { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import { AppActionDialog } from '@shared/ui/AppActionDialog';
import type { CountryCode } from '@shared/config/env';

import { sendWhatsAppOtp, verifyWhatsAppOtp } from '../authApi';
import { formatAuthPhoneDisplay } from '../authTypes';
import { completeNativeLogin } from '../authSession';
import { AuthFormHeader, AuthLegalFooter, AuthOtpHero, AuthToolbar } from '../components/AuthShell';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { AUTH_OTP_LENGTH, OtpInput, OtpResendRow, type OtpInputHandle } from '../components/OtpInput';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'OtpVerify'>;

type OtpDialog = {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  confirmLabel: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

function otpFailureCopy(rawMessage?: string): { title: string; message: string; inline: string } {
  const lower = (rawMessage ?? '').toLowerCase();
  const expiredOrInvalid =
    lower.includes('expired') || lower.includes('invalid') || lower.includes('incorrect');

  if (expiredOrInvalid) {
    return {
      title: 'Code expired or invalid',
      message:
        'This verification code is no longer valid. Request a new code or check your latest WhatsApp message.',
      inline: rawMessage?.trim() || 'That code is expired or invalid. Please try again.',
    };
  }

  return {
    title: 'Verification failed',
    message: rawMessage?.trim() || 'We could not verify that code. Please try again or request a new code.',
    inline: rawMessage?.trim() || 'Verification failed. Please try again.',
  };
}

export function OtpVerifyScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const { phone } = route.params;
  const otpInputRef = useRef<OtpInputHandle>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [dialog, setDialog] = useState<OtpDialog | null>(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const resetOtpEntry = useCallback(() => {
    setOtp('');
    setOtpError(null);
    setTimeout(() => otpInputRef.current?.focusFirst(), 120);
  }, []);

  const onOtpChange = useCallback(
    (value: string) => {
      setOtp(value);
      if (otpError) setOtpError(null);
    },
    [otpError],
  );

  const onResend = useCallback(async () => {
    setResendLoading(true);
    try {
      const result = await sendWhatsAppOtp(phone);
      if (result.success) {
        resetOtpEntry();
        setDialog({
          title: 'Code sent',
          message: 'A new verification code has been sent to your WhatsApp.',
          icon: 'checkmark-circle-outline',
          confirmLabel: 'Got it',
          hideCancel: true,
          onConfirm: closeDialog,
        });
      } else {
        setDialog({
          title: 'Could not resend',
          message: result.message ?? result.error ?? 'Unable to send a new code. Please try again.',
          icon: 'alert-circle-outline',
          confirmLabel: 'OK',
          hideCancel: true,
          onConfirm: closeDialog,
        });
      }
    } finally {
      setResendLoading(false);
    }
  }, [closeDialog, phone, resetOtpEntry]);

  const showOtpFailure = useCallback(
    (rawMessage?: string) => {
      const copy = otpFailureCopy(rawMessage);
      setOtp('');
      setOtpError(copy.inline);
      setDialog({
        title: copy.title,
        message: copy.message,
        icon: 'time-outline',
        confirmLabel: 'Try again',
        cancelLabel: 'Request new code',
        onConfirm: () => {
          closeDialog();
          resetOtpEntry();
        },
        onCancel: () => {
          closeDialog();
          void onResend();
        },
      });
    },
    [closeDialog, onResend, resetOtpEntry],
  );

  const onVerify = useCallback(async () => {
    if (otp.length < AUTH_OTP_LENGTH) {
      setDialog({
        title: 'Enter full code',
        message: `Please enter all ${AUTH_OTP_LENGTH} digits from your message.`,
        icon: 'keypad-outline',
        confirmLabel: 'Got it',
        hideCancel: true,
        onConfirm: closeDialog,
      });
      return;
    }
    setLoading(true);
    setOtpError(null);
    try {
      analytics.track('auth_whatsapp_verify_tap');
      const result = await verifyWhatsAppOtp(phone, otp);
      if (!result.success || !result.token) {
        showOtpFailure(result.message);
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
    } finally {
      setLoading(false);
    }
  }, [closeDialog, country, dispatch, navigation, otp, phone, showOtpFailure]);

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
          <AuthOtpHero
            destination={formatAuthPhoneDisplay(phone)}
            icon="logo-whatsapp"
            subtitle="We sent a 5-digit code on WhatsApp to"
            hint="Enter the code from your WhatsApp chat"
            variant="whatsapp"
          />
          <OtpInput ref={otpInputRef} value={otp} onChange={onOtpChange} error={otpError} />
          <AuthPrimaryButton label="Verify" onPress={() => void onVerify()} loading={loading} />
          <OtpResendRow
            onResend={() => void onResend()}
            loading={resendLoading}
            prefix="Didn't get the WhatsApp code?"
            linkLabel="Resend code"
          />
          <View style={{ flex: 1, minHeight: spacing.lg }} />
          <AuthLegalFooter />
        </ScrollView>
      </KeyboardAvoidingView>

      <AppActionDialog
        visible={dialog != null}
        title={dialog?.title}
        message={dialog?.message ?? ''}
        icon={dialog?.icon}
        confirmLabel={dialog?.confirmLabel}
        cancelLabel={dialog?.cancelLabel}
        hideCancel={dialog?.hideCancel}
        onConfirm={() => dialog?.onConfirm()}
        onCancel={() => (dialog?.onCancel ? dialog.onCancel() : closeDialog())}
      />
    </SafeAreaView>
  );
}
