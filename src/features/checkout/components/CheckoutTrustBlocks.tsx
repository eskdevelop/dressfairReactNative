import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import {
  CHECKOUT_DELIVERY_GUARANTEE_BULLETS,
  CHECKOUT_TRUST_BLOCKS,
} from '@features/checkout/checkoutTrustContent';
import { CheckoutGuaranteeBulletGrid, CheckoutLearnMoreLink } from '@features/checkout/components/CheckoutLearnMoreLink';

type BlockShellProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
  onLearnMore: () => void;
  learnMoreLabel?: string;
};

function TrustBlockShell({
  icon,
  title,
  children,
  onLearnMore,
  learnMoreLabel,
}: BlockShellProps): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Ionicons name={icon} size={20} color={colors.brand} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.brand, lineHeight: 16 }}>
            {title}
          </Text>
          <View style={{ marginTop: 2 }}>{children}</View>
          <CheckoutLearnMoreLink label={learnMoreLabel} onPress={onLearnMore} />
        </View>
      </View>
    </View>
  );
}

type Props = {
  onDeliveryLearnMore: () => void;
  onSecurePrivacyLearnMore: () => void;
  onPurchaseProtectionLearnMore: () => void;
};

export function CheckoutTrustBlocks({
  onDeliveryLearnMore,
  onSecurePrivacyLearnMore,
  onPurchaseProtectionLearnMore,
}: Props): React.ReactElement {
  const copy = CHECKOUT_TRUST_BLOCKS;

  return (
    <View>
      <TrustBlockShell
        icon="car-outline"
        title={copy.delivery.title}
        onLearnMore={onDeliveryLearnMore}
        learnMoreLabel={copy.delivery.learnMoreLabel}
      >
        <CheckoutGuaranteeBulletGrid items={CHECKOUT_DELIVERY_GUARANTEE_BULLETS} />
      </TrustBlockShell>

      <View style={{ height: 6, backgroundColor: '#F5F5F5' }} />

      <TrustBlockShell
        icon="lock-closed-outline"
        title={copy.securePrivacy.title}
        onLearnMore={onSecurePrivacyLearnMore}
        learnMoreLabel={copy.securePrivacy.learnMoreLabel}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '400',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: 16,
          }}
        >
          {copy.securePrivacy.subtitle}
        </Text>
      </TrustBlockShell>

      <View style={{ height: 6, backgroundColor: '#F5F5F5' }} />

      <TrustBlockShell
        icon="cart-outline"
        title={copy.purchaseProtection.title}
        onLearnMore={onPurchaseProtectionLearnMore}
        learnMoreLabel={copy.purchaseProtection.learnMoreLabel}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '400',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: 16,
          }}
        >
          {copy.purchaseProtection.subtitle}
        </Text>
      </TrustBlockShell>
    </View>
  );
}
