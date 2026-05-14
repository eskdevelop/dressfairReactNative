import React, { type ComponentProps } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Port of Flutter `available_offers_sheet.dart` — English parity. */
export function OffersModal({ visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  return (
    <Modal transparent={false} visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, paddingTop: 12, paddingHorizontal: 14, paddingBottom: 8 }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 12,
              backgroundColor: '#9CA3AF',
              marginBottom: 12,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '600' }}>Available offers</Text>
          <TouchableOpacity accessibilityRole="button" onPress={onClose}>
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: Math.min(height * 0.76, height - 64) }}
        >
          <SectionTitle title="Delivery guarantee" />
          <OfferCard
            ion="car-outline"
            title="Reliable delivery"
            details={['Consistent fulfilment logistics on every order']}
          />
          <SectionTitle title="Shopping benefits" />
          <OfferCard ion="flash-outline" title="Fast dispatch" details={["Usually dispatched within two to three working days"]} />
          <OfferCard ion="gift-outline" title="Free shipping" details={['Eligible cart-value promotions may apply']} />
          <OfferCard ion="cash-outline" title="Cash on delivery" details={['Pay when you receive your order']} />
          <SectionTitle title="Safe payments" />
          <OfferCard ion="shield-checkmark-outline" title="Secure checkout" details={['Industry-standard TLS on payment steps']} />
          <SectionTitle title="Privacy" />
          <OfferCard ion="lock-closed-outline" title="Protecting your data" details={['We only collect what checkout needs to fulfil your orders']} />
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        marginTop: 12,
        marginBottom: 6,
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
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
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        padding: 10,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={ion} size={22} color="#374151" />
      </View>
      <View style={{ flex: 1, paddingLeft: 10 }}>
        <Text style={{ fontWeight: '600', fontSize: 13 }}>{title}</Text>
        {details.map(line => (
          <Text key={line} style={{ marginTop: 4, fontSize: 11.5, color: '#4B5563' }}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

