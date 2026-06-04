import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LoginChooser'>;

export function LoginChooserScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [googleLoading, setGoogleLoading] = useState(false);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <AuthToolbar mode="close" onClose={onClose} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AuthBrandHeader />
        <AuthPromoStrip />
        <View style={{ height: spacing.xl }} />
        <AuthWhatsAppButton onPress={() => navigation.navigate('WhatsAppPhone')} />
        <AuthOutlinedButton
          label="Continue with Email"
          icon="mail-outline"
          onPress={() => navigation.navigate('EmailLogin')}
        />
        <AuthGoogleButton
          label={googleLoading ? 'Signing in…' : 'Continue with Google'}
          onPress={() => void onGoogle()}
        />
        <AuthLegalFooter />
      </ScrollView>
      <AppLoadingOverlay visible={googleLoading} message="Signing you in…" />
    </SafeAreaView>
  );
}
