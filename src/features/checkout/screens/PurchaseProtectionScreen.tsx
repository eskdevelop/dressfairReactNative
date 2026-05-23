import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Step({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}): React.ReactElement {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>{num}</Text>
        </View>
        <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#111' }}>{title}</Text>
      </View>
      <Text
        style={{
          marginTop: 6,
          fontSize: 11.5,
          fontWeight: '400',
          color: 'rgba(0,0,0,0.55)',
          lineHeight: 17,
        }}
      >
        {desc}
      </Text>
    </View>
  );
}

export function PurchaseProtectionScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.sm,
          minHeight: 48,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
        }}
      >
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 15,
            fontWeight: '600',
            color: '#111',
            marginRight: 28,
          }}
        >
          Dress Fair Purchase Protection
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <View
          style={{
            backgroundColor: '#E8F5E9',
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="bag-handle-outline" size={20} color="#2E7D32" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1B5E20', lineHeight: 18 }}>
                Shop confidently — Dress Fair Purchase Protection Program
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 11.5,
                  fontWeight: '400',
                  color: '#2E7D32',
                  lineHeight: 17,
                }}
              >
                Get a full refund if your item does not arrive, arrives damaged, or is not as
                described.
              </Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontWeight: '600', color: '#111' }}>
          Dress Fair Purchase Protection
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: 'rgba(0,0,0,0.85)',
            lineHeight: 17,
          }}
        >
          Easily get help with your order if something goes wrong.
        </Text>

        <Text style={{ marginTop: spacing.lg, fontSize: 13, fontWeight: '600', color: '#111' }}>
          What is eligible?
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: 'rgba(0,0,0,0.85)',
            lineHeight: 17,
          }}
        >
          Your order may be eligible for a refund or replacement when items are lost, damaged, or
          materially different from the description.
        </Text>

        <View
          style={{
            marginTop: spacing.lg,
            backgroundColor: 'rgba(255, 244, 230, 0.55)',
            padding: spacing.md,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111', marginBottom: 10 }}>
            We&apos;ve got your back
          </Text>
          <Step
            num="1"
            title="File a return"
            desc="Select the item you want to return and choose a reason from your order details."
          />
          <Step
            num="2"
            title="Awaiting pick up"
            desc="Please prepare the return package. Our courier partner will collect it when applicable."
          />
          <Step
            num="3"
            title="Get refunded"
            desc="If your order is eligible, your refund will be processed after the return is verified."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
