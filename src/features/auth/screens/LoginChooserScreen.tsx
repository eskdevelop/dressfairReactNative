import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';
import { AppLoadingOverlay } from '@shared/ui/AppLoadingOverlay';

import {
  AuthBrandHeader,
  AuthLegalFooter,
  AuthPromoStrip,
  AuthToolbar,
} from '../components/AuthShell';
// AuthWhatsAppButton is temporarily unused — the WhatsApp login button is
// commented out below until that flow is fixed. Re-add to this import then.
import { AuthGoogleButton, AuthOutlinedButton } from '../components/AuthOutlinedButton';
import type { AuthStackParamList } from '../AuthNavigator';
import { signInWithApple } from '../appleAuth';
import { signInWithGoogle } from '../googleAuth';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LoginChooser'>;

export function LoginChooserScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const onClose = useCallback(() => {
    analytics.track('auth_chooser_close');
    navigation.getParent()?.goBack();
  }, [navigation]);

  const onGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.ok) {
        navigation.getParent()?.goBack();
      } else if (!result.cancelled && result.message) {
        Alert.alert('Sign in with Google', result.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [navigation]);

  const onApple = useCallback(async () => {
    setAppleLoading(true);
    try {
      const result = await signInWithApple();
      if (result.ok) {
        navigation.getParent()?.goBack();
      } else if (!result.cancelled && result.message) {
        Alert.alert('Sign in with Apple', result.message);
      }
    } finally {
      setAppleLoading(false);
    }
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="close" onClose={onClose} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AuthBrandHeader />
        <AuthPromoStrip />
        <View style={{ height: spacing.xl }} />
        {/* TEMPORARILY HIDDEN: "Continue with WhatsApp" login is not fully
            working yet. Per product decision, hide it on both iOS and Android
            and re-enable once the WhatsApp flow is fixed. */}
        {/* <AuthWhatsAppButton onPress={() => navigation.navigate('WhatsAppPhone')} /> */}
        <AuthOutlinedButton
          label="Continue with Email"
          icon="mail-outline"
          onPress={() => navigation.navigate('EmailLogin')}
        />
        <AuthGoogleButton
          label={googleLoading ? 'Signing in…' : 'Continue with Google'}
          onPress={() => void onGoogle()}
        />
        {/* Apple Sign-In is native to iOS only. Android would require an Apple
            Services ID + HTTPS return URL + server relay, so we hide it there. */}
        {Platform.OS === 'ios' ? (
          <AuthOutlinedButton
            label={appleLoading ? 'Signing in…' : 'Sign in with Apple'}
            icon="logo-apple"
            onPress={() => void onApple()}
          />
        ) : null}
        <AuthLegalFooter />
      </ScrollView>
      <AppLoadingOverlay
        visible={googleLoading || appleLoading}
        message="Signing you in…"
      />
    </SafeAreaView>
  );
}
