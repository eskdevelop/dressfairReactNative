import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppSelector } from '@app/hooks';
import { WebViewScreen } from '@features/webview/WebViewScreen';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationRouter'>;

export function NotificationRouterScreen({ route }: Props) {
  const path = route.params?.path ?? '/';
  const country = useAppSelector(s => s.app.country);
  const storefrontSurfaceGeneration = useAppSelector(s => s.app.storefrontSurfaceGeneration);
  return (
    <WebViewScreen key={`notification-router-${country}-${storefrontSurfaceGeneration}`} path={path} />
  );
}
