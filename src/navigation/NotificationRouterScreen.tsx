import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationRouter'>;

export function NotificationRouterScreen({ route }: Props) {
  const path = route.params?.path ?? '/';
  return <WebViewScreen path={path} />;
}
