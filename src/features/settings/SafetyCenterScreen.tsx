import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@app/theme/tokens';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

const TILE_GREEN = '#16A34A';
const HEADER_GREEN_START = '#2E7D32';
const HEADER_GREEN_END = '#4CAF50';

type InfoTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function InfoTile({ icon, label }: InfoTileProps): React.ReactElement {
  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Ionicons name={icon} size={26} color={TILE_GREEN} />
      <Text
        style={{
          marginTop: 8,
          fontSize: 12,
          textAlign: 'center',
          color: '#111827',
          lineHeight: 16,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }): React.ReactElement {
  return (
    <Text
      style={{
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
      }}
    >
      {children}
    </Text>
  );
}

function ReportRow({ title }: { title: string }): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() => {
        analytics.track('safety_center_report_row', { title });
        navigation.navigate('Contact');
      }}
      accessibilityRole="button"
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <Text style={{ flex: 1, fontSize: 14, color: '#111827', lineHeight: 20 }}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function ThinDivider(): React.ReactElement {
  return <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />;
}

export function SafetyCenterScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: HEADER_GREEN_START }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
          style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        >
          <LinearGradient
            colors={[HEADER_GREEN_START, HEADER_GREEN_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 36,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 4,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Safety And Security
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 28 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}>
                  Safety center
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    lineHeight: 19,
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  Dress Fair is committed to creating a safe shopping environment. Learn about our
                  efforts to enhance Dress Fair's security for you.
                </Text>
              </View>
              <Ionicons name="shield-outline" size={48} color="rgba(255,255,255,0.92)" />
            </View>
          </LinearGradient>

          <View
            style={{
              marginTop: -24,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 28,
            }}
          >
            <SectionTitle>We protect your information on Dress Fair</SectionTitle>
            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
              <InfoTile icon="lock-closed-outline" label={'Data\nprotection'} />
              <InfoTile icon="person-outline" label={'Account\nprotection'} />
              <InfoTile icon="cart-outline" label={'Payment\nprotection'} />
            </View>

            <View style={{ height: 24 }} />
            <SectionTitle>Stay safe from scammers</SectionTitle>
            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
              <InfoTile icon="warning-outline" label={'Recognize\nscams'} />
              <InfoTile icon="mail-outline" label={'Recognize scam\nemails'} />
              <InfoTile icon="chatbubble-outline" label={'Recognize scam\nmessages'} />
            </View>

            <View style={{ height: 24 }} />
            <SectionTitle>Report something suspicious</SectionTitle>
            <View style={{ height: 4 }} />

            <ReportRow title="Report a suspicious phone call, email or SMS/text message" />
            <ThinDivider />
            <ReportRow title="Report a fake website or app similar to Dress Fair" />
            <ThinDivider />
            <ReportRow title="Report fake promotions, gift card fraud, fake job opportunities, etc" />

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
