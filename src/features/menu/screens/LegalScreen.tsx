import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import type { LegalBlock } from '@features/menu/content/legalBlock';
import { analytics } from '@shared/observability/analytics';
import { getEnvConfig } from '@shared/config/env';
import type { RootStackParamList } from '@navigation/types';

// Shared shell for the native Terms / Privacy / Return Policy / About
// screens. Rendering the full text inside a ScrollView (rather than opening
// a web browser) is the behaviour App Review credits as native content vs
// "wrapper".
type Props = {
  title: string;
  lastUpdated?: string;
  // Either provide structured `blocks` (preferred — supports headings + list
  // items + paragraphs) or fall back to a flat `paragraphs` array. At least
  // one must be provided.
  blocks?: LegalBlock[];
  paragraphs?: string[];
  // Optional anchor on the live website. When provided, a "View on web" link
  // appears at the bottom for users who want to verify the canonical copy.
  webPath?: string;
  webEventName?: string;
  isPlaceholder?: boolean;
};

const blocksFromParagraphs = (paragraphs: string[]): LegalBlock[] =>
  paragraphs.map(text => ({ kind: 'p', text }));

export function LegalScreen({
  title,
  lastUpdated,
  blocks,
  paragraphs,
  webPath,
  webEventName,
  isPlaceholder = false,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const country = useAppSelector(state => state.app.country);
  const cfg = getEnvConfig(country);

  const resolvedBlocks =
    blocks ?? (paragraphs ? blocksFromParagraphs(paragraphs) : []);

  const openOnWeb = () => {
    if (!webPath) return;
    const url = `${cfg.webBaseUrl}${webPath}`;
    if (webEventName) analytics.track(webEventName, { url });
    Linking.openURL(url).catch(() => {
      // Best-effort — the in-app text is already authoritative.
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: spacing.sm }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
            marginLeft: spacing.sm,
          }}
        >
          {title}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
      >
        {isPlaceholder ? (
          <View
            accessibilityRole="alert"
            style={{
              borderWidth: 1,
              borderColor: colors.danger,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
              backgroundColor: '#FEF2F2',
            }}
          >
            <Text
              style={{
                color: colors.danger,
                fontWeight: '700',
                marginBottom: spacing.xs,
              }}
            >
              Pre-launch placeholder
            </Text>
            <Text style={{ color: colors.textPrimary, lineHeight: 20 }}>
              The text below is a placeholder. Replace the content in the
              corresponding file under{' '}
              <Text style={{ fontWeight: '700' }}>menu/content/</Text> and flip
              the isPlaceholder flag to false before submitting to the App
              Store.
            </Text>
          </View>
        ) : null}

        {lastUpdated ? (
          <Text
            style={{
              color: colors.textMuted,
              marginBottom: spacing.lg,
              fontSize: 12,
            }}
          >
            {lastUpdated}
          </Text>
        ) : null}

        {resolvedBlocks.map((block, index) => {
          if (block.kind === 'h') {
            return (
              <Text
                key={index}
                style={{
                  color: colors.textPrimary,
                  fontWeight: '700',
                  fontSize: 15,
                  letterSpacing: 0.3,
                  marginTop: index === 0 ? 0 : spacing.lg,
                  marginBottom: spacing.sm,
                  textTransform: 'uppercase',
                }}
              >
                {block.text}
              </Text>
            );
          }
          if (block.kind === 'li') {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  marginBottom: spacing.sm,
                  paddingLeft: spacing.sm,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    lineHeight: 22,
                    marginRight: spacing.sm,
                  }}
                >
                  •
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    lineHeight: 22,
                    flex: 1,
                  }}
                >
                  {block.text}
                </Text>
              </View>
            );
          }
          return (
            <Text
              key={index}
              style={{
                color: colors.textPrimary,
                lineHeight: 22,
                marginBottom: spacing.md,
              }}
            >
              {block.text}
            </Text>
          );
        })}

        {webPath ? (
          <TouchableOpacity
            onPress={openOnWeb}
            accessibilityRole="link"
            style={{ marginTop: spacing.lg }}
          >
            <Text style={{ color: colors.brand, textAlign: 'center' }}>
              View the latest version on dressfair.com
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
