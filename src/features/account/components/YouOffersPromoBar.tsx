import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#15803d';
const BAR_BG = '#FFF7ED'; // ~ orange.shade50

type Props = {
  onPress: () => void;
};

/** Flutter promo row: horizontal scroll + green checks + Offers sheet tap. */
export function YouOffersPromoBar({ onPress }: Props): React.ReactElement {
  return (
    <Pressable onPress={onPress}>
      <View style={{ backgroundColor: BAR_BG, paddingVertical: 8, paddingHorizontal: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark" color={GREEN} size={18} />
            <Text style={{ marginLeft: 6, fontSize: 10, color: GREEN, fontWeight: '500' }}>Free shipping</Text>

            <View style={{ width: 14 }} />

            <Ionicons name="checkmark" color={GREEN} size={18} />
            <Text style={{ marginLeft: 6, fontSize: 10, color: GREEN, fontWeight: '500' }}>
              Pay when you receive your order
            </Text>

            <View style={{ width: 16 }} />

            <Ionicons name="chevron-forward" color={GREEN} size={12} />
          </View>
        </ScrollView>
      </View>
    </Pressable>
  );
}
