import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function SectionTitle({ title }: { title: string }): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg }}>
      <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginTop: 1 }} />
      <Text
        style={{
          flex: 1,
          marginLeft: 6,
          fontSize: 13,
          fontWeight: '600',
          color: '#16A34A',
          lineHeight: 18,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function BodyText({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text
      style={{
        marginTop: 6,
        fontSize: 11.5,
        fontWeight: '400',
        color: 'rgba(0,0,0,0.87)',
        lineHeight: 18,
      }}
    >
      {children}
    </Text>
  );
}

function BulletText({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 10 }}>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.87)', lineHeight: 18 }}>• </Text>
      <Text
        style={{
          flex: 1,
          fontSize: 11.5,
          fontWeight: '400',
          color: 'rgba(0,0,0,0.87)',
          lineHeight: 18,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function LinkText({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={{ marginTop: 6 }}>
      <Text style={{ fontSize: 11.5, fontWeight: '400', color: colors.brand, lineHeight: 18 }}>
        {children} ›
      </Text>
    </Pressable>
  );
}

export function DeliveryGuaranteeScreen(): React.ReactElement {
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
            fontSize: 16,
            fontWeight: '500',
            color: '#111',
            marginRight: 28,
          }}
        >
          Delivery guarantee
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="shield-checkmark" size={18} color="#16A34A" style={{ marginTop: 2 }} />
          <Text
            style={{
              flex: 1,
              marginLeft: 6,
              fontSize: 15,
              fontWeight: '600',
              color: '#16A34A',
              lineHeight: 20,
            }}
          >
            Shop confidently with delivery guarantee
          </Text>
        </View>
        <BodyText>
          Dress Fair stands behind on-time delivery. If we miss our commitment, you may receive
          account credit or a refund according to the terms below.
        </BodyText>

        <SectionTitle title="Credit for delay" />
        <BodyText>
          If your order is not delivered before or on the latest delivery date provided to you,
          depending on the shipping method of your package you will be issued credit for Standard
          Shipping.
        </BodyText>
        <BulletText>Credit applies to Standard Shipping fees where eligible.</BulletText>
        <BodyText>
          The credit will be added to your Dress Fair credit balance within 48 hours of the latest
          delivery date and can be used on your next order.
        </BodyText>
        <LinkText onPress={() => navigation.navigate('Privacy')}>
          For more exceptions and details see our Privacy Policy
        </LinkText>

        <SectionTitle title="Return if item damaged" />
        <BodyText>
          If you receive your package and find that some items were lost or damaged in transit, rest
          assured that you can easily apply for a full refund for those items.
        </BodyText>

        <SectionTitle title="Refund for no update" />
        <BodyText>
          If there have been no tracking updates for a period of time and your package has not been
          delivered, you can request a free reshipment or refund.
        </BodyText>
        <BulletText>15 days without updates for packages shipped from overseas by air</BulletText>
        <BulletText>15 days without updates for packages shipped from overseas by land</BulletText>
        <BodyText>
          If you receive the package after requesting a refund, please contact support promptly.
        </BodyText>
        <LinkText onPress={() => navigation.navigate('Privacy')}>
          For more exceptions and details see our Privacy Policy
        </LinkText>

        <SectionTitle title="Refund for no delivery" />
        <BodyText>
          If your package is not delivered within the maximum delivery window, you may qualify for a
          refund.
        </BodyText>
        <BulletText>30 days for standard international shipments</BulletText>
        <BulletText>45 days for economy international shipments</BulletText>
        <BodyText>
          If you receive the package after a refund has been issued, please notify us so we can help.
        </BodyText>
        <LinkText onPress={() => navigation.navigate('Privacy')}>
          For more exceptions and details see our Privacy Policy
        </LinkText>

        <View style={{ flexDirection: 'row', marginTop: spacing.lg, alignItems: 'flex-start' }}>
          <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" style={{ marginTop: 2 }} />
          <Text
            style={{
              flex: 1,
              marginLeft: 6,
              fontSize: 12,
              color: 'rgba(0,0,0,0.54)',
              lineHeight: 17,
            }}
          >
            These details are specific to Dress Fair delivery guarantee and may be updated from
            time to time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
