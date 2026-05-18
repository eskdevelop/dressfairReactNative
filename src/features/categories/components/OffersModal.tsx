import React, { type ComponentProps } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@app/theme/tokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

const OFFER_ICON_GREEN = colors.success;

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Port of Flutter `available_offers_sheet.dart` — bottom sheet + English parity. */
export function OffersModal({ visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetMaxHeight = height * 0.82;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
          pointerEvents="auto"
        >
          <View style={{ alignItems: 'center' }}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Available Offers</Text>
            <TouchableOpacity accessibilityRole="button" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: sheetMaxHeight - 100 }}
            showsVerticalScrollIndicator={false}
          >
            <SectionTitle title="Delivery guarantee" />
            <OfferCard
              ion="car-outline"
              title="Reliable Delivery"
              details={[
                'We work with reliable fulfilment partners so your DressFair orders keep moving from warehouse to doorstep with consistent tracking and support.',
              ]}
            />

            <SectionTitle title="Shopping Benefits" />
            <OfferCard
              ion="flash-outline"
              title="Fast Shipping"
              details={['Normally delivered in 2–3 days']}
            />
            <OfferCard
              ion="gift-outline"
              title="Free shipping"
              details={['Free shipping applied on eligible orders']}
            />
            <OfferCard
              ion="cash-outline"
              title="Cash On Delivery"
              details={['Pay when you receive your order']}
            />

            <SectionTitle title="Safe Payments" />
            <OfferCard
              ion="shield-checkmark-outline"
              title="Fast & Secure"
              details={['Real-time, encrypted checkout with industry-standard protection on payment steps']}
            />

            <SectionTitle title="Privacy" />
            <OfferCard
              ion="lock-closed-outline"
              title="Protecting your data"
              details={['We only collect what checkout needs to fulfil your orders']}
            />
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
});

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        marginTop: 12,
        marginBottom: 6,
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
      }}
    >
      {title}
    </Text>
  );
}

function OfferCard({ ion, title, details }: { ion: IonName; title: string; details: string[] }) {
  return (
    <View
      style={{
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFFFFF',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#ECFDF5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={ion} size={22} color={OFFER_ICON_GREEN} />
      </View>
      <View style={{ flex: 1, paddingLeft: 12 }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.textPrimary }}>{title}</Text>
        {details.map((line, idx) => (
          <Text key={`${title}-${idx}`} style={{ marginTop: 4, fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
