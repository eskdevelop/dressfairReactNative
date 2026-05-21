import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EmailLoginScreen } from './screens/EmailLoginScreen';
import { EmailOtpVerifyScreen } from './screens/EmailOtpVerifyScreen';
import { LoginChooserScreen } from './screens/LoginChooserScreen';
import { OtpVerifyScreen } from './screens/OtpVerifyScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { WhatsAppPhoneScreen } from './screens/WhatsAppPhoneScreen';

export type AuthStackParamList = {
  LoginChooser: undefined;
  WhatsAppPhone: undefined;
  OtpVerify: { phone: string };
  EmailLogin: undefined;
  EmailOtpVerify: { email: string; interimToken?: string };
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginChooser" component={LoginChooserScreen} />
      <Stack.Screen name="WhatsAppPhone" component={WhatsAppPhoneScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <Stack.Screen name="EmailOtpVerify" component={EmailOtpVerifyScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
