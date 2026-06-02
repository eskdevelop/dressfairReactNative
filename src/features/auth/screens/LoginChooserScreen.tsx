import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@app/theme/tokens';
import { analytics } from '@shared/observability/analytics';

import {
  AuthBrandHeader,
  AuthLegalFooter,
  AuthPromoStrip,
  AuthToolbar,
} from '../components/AuthShell';
// AuthGoogleButton, AuthWhatsAppButton are temporarily unused — those login
// buttons are commented out below until those flows are fixed. Re-add to this
// import then.
import { AuthOutlinedButton } from '../components/AuthOutlinedButton';
import type { AuthStackParamList } from '../AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LoginChooser'>;

export function LoginChooserScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();

  const onClose = useCallback(() => {
    analytics.track('auth_chooser_close');
    navigation.getParent()?.goBack();
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
        {/* TEMPORARILY HIDDEN: Google login hidden until the flow is stable
            across TestFlight / production builds. Re-enable with onGoogle handler. */}
        {/* <AuthGoogleButton
          label={googleLoading ? 'Signing in…' : 'Continue with Google'}
          onPress={() => void onGoogle()}
        /> */}
        {/* TEMPORARILY HIDDEN: Apple Sign-In hidden until backend accepts the
            native iOS JWT audience (bundle ID). Re-enable with onApple handler. */}
        {/* {Platform.OS === 'ios' ? (
          <AuthOutlinedButton
            label={appleLoading ? 'Signing in…' : 'Sign in with Apple'}
            icon="logo-apple"
            onPress={() => void onApple()}
          />
        ) : null} */}
        <AuthLegalFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
