import React from 'react';
import { Text, View } from 'react-native';
import * as Network from 'expo-network';

import { useAppSelector } from '@app/hooks';
import { sessionStore } from '@features/auth/sessionStore';
import { colors, radii, spacing } from '@app/theme/tokens';

export function HealthDebugPanel() {
  const app = useAppSelector(state => state.app);
  const [networkType, setNetworkType] = React.useState<string>('unknown');
  const [hasSessionToken, setHasSessionToken] = React.useState<boolean>(false);
  const [hasPushToken, setHasPushToken] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [network, sessionToken, pushToken] = await Promise.all([
        Network.getNetworkStateAsync(),
        sessionStore.getToken(),
        sessionStore.getPushToken(),
      ]);
      if (!mounted) return;
      setNetworkType(network.type ?? 'unknown');
      setHasSessionToken(Boolean(sessionToken));
      setHasPushToken(Boolean(pushToken));
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const item = (label: string, value: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{value}</Text>
    </View>
  );

  return (
    <View
      style={{
        marginTop: spacing.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        gap: spacing.sm,
      }}
    >
      <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Health Debug</Text>
      {item('Country', app.country)}
      {item('Offline mode', app.isOffline ? 'Yes' : 'No')}
      {item('Bootstrapped', app.isBootstrapped ? 'Yes' : 'No')}
      {item('Authenticated', app.isAuthenticated ? 'Yes' : 'No')}
      {item('Network type', networkType)}
      {item('Session token', hasSessionToken ? 'Present' : 'Missing')}
      {item('Push token', hasPushToken ? 'Present' : 'Missing')}
    </View>
  );
}
