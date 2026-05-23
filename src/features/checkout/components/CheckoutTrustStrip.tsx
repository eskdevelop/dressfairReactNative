import React from 'react';
import { View } from 'react-native';

import { spacing } from '@app/theme/tokens';
import { MarqueeText } from '@shared/ui/MarqueeText';

/** Flutter `static_slider_checkout.dart` + `marquee` package parity. */
const CHECKOUT_MARQUEE_TEXT =
  'All Data is safeguarded • Free Shipping on eligible orders • Pay with confidence';

const STRIP_GREEN = '#1BAA68';

export function CheckoutTrustStrip(): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        height: 25,
        borderWidth: 1,
        borderColor: STRIP_GREEN,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <MarqueeText
        text={CHECKOUT_MARQUEE_TEXT}
        speed={50}
        gap={50}
        pauseMs={1000}
        startPadding={10}
        style={{
          fontSize: 10,
          fontWeight: '400',
          color: STRIP_GREEN,
          lineHeight: 14,
        }}
      />
    </View>
  );
}
