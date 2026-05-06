import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@app/theme/tokens';
import { faqEntries } from '@features/menu/content/faq';
import type { FaqEntry } from '@features/menu/content/faq';
import type { RootStackParamList } from '@navigation/types';
import { analytics } from '@shared/observability/analytics';

// Renders a question/answer that toggles open on tap. The collapsible
// pattern is one of the small native interactions that App Review credits
// as substantive, and it scales naturally as we add more questions.
function FaqRow({ entry }: { entry: FaqEntry }) {
  const [expanded, setExpanded] = useState(false);

  const onToggle = useCallback(() => {
    setExpanded(prev => {
      const next = !prev;
      analytics.track('faq_toggled', { id: entry.id, expanded: next });
      return next;
    });
  }, [entry.id]);

  const paragraphs = Array.isArray(entry.answer) ? entry.answer : [entry.answer];

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Text
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          {entry.question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
          }}
        >
          {paragraphs.map((paragraph, idx) => (
            <Text
              key={idx}
              style={{
                color: colors.textPrimary,
                lineHeight: 22,
                marginBottom: idx === paragraphs.length - 1 ? 0 : spacing.sm,
              }}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function FaqScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
          Frequently Asked Questions
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {faqEntries.map(entry => (
          <FaqRow key={entry.id} entry={entry} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
