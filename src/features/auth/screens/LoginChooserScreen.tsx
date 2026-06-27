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
import {
  AuthGoogleButton,
  AuthOutlinedButton,
  AuthWhatsAppButton,
} from '../components/AuthOutlinedButton';
import type { AuthStackParamList } from '../AuthNavigator';
import { signInWithGoogle } from '../googleAuth';
// import { signInWithApple } from '../appleAuth';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LoginChooser'>;

export function LoginChooserScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [googleLoading, setGoogleLoading] = useState(false);
  // const [appleLoading, setAppleLoading] = useState(false);

  // Third-party logins (WhatsApp, Google) are flaky on iOS for now, so they are
  // shown on Android only. iOS falls back to email/password. Apple is disabled
  // on both platforms (see commented handler/button below to re-enable).
  const isAndroid = Platform.OS === 'android';

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

  /*
   * Apple sign-in handler — disabled for now (iOS shows email/password only).
   * To re-enable, restore the appleLoading state, the signInWithApple import,
   * this handler, and the matching button in the JSX below.
   *
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
  */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="close" onClose={onClose} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AuthBrandHeader />
        <AuthPromoStrip />
        <View style={{ height: spacing.xl }} />

        {/* WhatsApp login — Android only (flaky on iOS for now). */}
        {isAndroid ? (
          <AuthWhatsAppButton onPress={() => navigation.navigate('WhatsAppPhone')} />
        ) : null}

        <AuthOutlinedButton
          label="Continue with Email"
          icon="mail-outline"
          onPress={() => navigation.navigate('EmailLogin')}
        />

        {/* Google login — Android only (flaky on iOS for now). */}
        {isAndroid ? (
          <AuthGoogleButton
            label={googleLoading ? 'Signing in…' : 'Continue with Google'}
            onPress={() => void onGoogle()}
          />
        ) : null}

        {/* Apple login (iOS) disabled for now — email/password only on iOS.
        {Platform.OS === 'ios' ? (
          <AuthOutlinedButton
            label={appleLoading ? 'Signing in…' : 'Sign in with Apple'}
            icon="logo-apple"
            onPress={() => void onApple()}
          />
        ) : null}
        */}

        <AuthLegalFooter />
      </ScrollView>

      <AppLoadingOverlay visible={googleLoading} message="Signing you in…" />
    </SafeAreaView>
  );
}
