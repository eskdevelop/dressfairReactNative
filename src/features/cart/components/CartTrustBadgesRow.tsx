import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing } from '@app/theme/tokens';

/** Temu trust-row green (solid icons). */
const TEMU_GREEN = '#0AB939';
/** Temu trust-row label grey. */
const LABEL_COLOR = '#888888';

type Badge = {
  key: string;
  icon: React.ReactElement;
  line1: string;
  line2: string;
};

function ShieldCartIcon(): React.ReactElement {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="shield" size={24} color={TEMU_GREEN} />
      <MaterialCommunityIcons name="cart" size={11} color="#FFFFFF" style={{ position: 'absolute', top: 8 }} />
    </View>
  );
}

function TruckCheckIcon(): React.ReactElement {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="truck" size={22} color={TEMU_GREEN} />
      <MaterialCommunityIcons
        name="check-bold"
        size={9}
        color="#FFFFFF"
        style={{ position: 'absolute', right: 1, bottom: 5 }}
      />
    </View>
  );
}

const BADGES: Badge[] = [
  {
    key: 'safe-payment',
    icon: <MaterialCommunityIcons name="shield-check" size={24} color={TEMU_GREEN} />,
    line1: 'Safe Payment',
    line2: 'Options',
  },
  {
    key: 'secure-privacy',
    icon: <MaterialCommunityIcons name="lock" size={22} color={TEMU_GREEN} />,
    line1: 'Secure',
    line2: 'privacy',
  },
  {
    key: 'purchase-protection',
    icon: <ShieldCartIcon />,
    line1: 'Dress Fair Purchase',
    line2: 'Protection',
  },
  {
    key: 'delivery-guarantee',
    icon: <TruckCheckIcon />,
    line1: 'Delivery',
    line2: 'guarantee',
  },
];

function TrustBadge({ icon, line1, line2 }: Omit<Badge, 'key'>): React.ReactElement {
  const labelStyle = {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '400' as const,
    color: LABEL_COLOR,
    textAlign: 'center' as const,
    alignSelf: 'stretch' as const,
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 2 }}>
      {icon}
      <View style={{ marginTop: 6, minHeight: 26, alignSelf: 'stretch' }}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={labelStyle}>
          {line1}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={labelStyle}>
          {line2}
        </Text>
      </View>
    </View>
  );
}

export function CartTrustBadgesRow(): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingVertical: 12,
        }}
      >
        {BADGES.map(badge => (
          <TrustBadge key={badge.key} icon={badge.icon} line1={badge.line1} line2={badge.line2} />
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />
    </View>
  );
}
