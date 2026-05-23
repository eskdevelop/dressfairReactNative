import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label?: string;
  onPress: () => void;
};

export function CheckoutLearnMoreLink({
  label = 'Learn More',
  onPress,
}: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7, alignSelf: 'flex-start' }}
    >
      <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(0,0,0,0.5)' }}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={11}
        color="rgba(0,0,0,0.5)"
        style={{ marginLeft: 3, marginTop: 1 }}
      />
    </Pressable>
  );
}

/** Two-column bullet row (Flutter `deliveryQuarantee` layout). */
export function CheckoutGuaranteeBulletGrid({
  items,
}: {
  items: readonly string[];
}): React.ReactElement {
  const leftCol = [items[0], items[2]].filter(Boolean);
  const rightCol = [items[1], items[3]].filter(Boolean);

  return (
    <View style={{ marginTop: 8, gap: 4 }}>
      {[0, 1].map(rowIdx => {
        const left = leftCol[rowIdx];
        const right = rightCol[rowIdx];
        if (!left && !right) return null;
        return (
          <View key={rowIdx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {left ? (
              <Text
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: '400',
                  color: 'rgba(0,0,0,0.7)',
                  lineHeight: 14,
                }}
                numberOfLines={2}
              >
                ✓ {left}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            {right ? (
              <Text
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: '400',
                  color: 'rgba(0,0,0,0.7)',
                  lineHeight: 14,
                  paddingLeft: 8,
                }}
                numberOfLines={2}
              >
                ✓ {right}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
