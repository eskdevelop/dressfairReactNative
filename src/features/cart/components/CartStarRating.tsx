import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RATING = 4.5;
const REVIEW_COUNT = 4;

export function CartStarRating(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
      {Array.from({ length: 5 }, (_, index) => {
        if (RATING >= index + 1) {
          return <Ionicons key={index} name="star" size={12} color="#111" />;
        }
        if (RATING > index && RATING < index + 1) {
          return <Ionicons key={index} name="star-half" size={12} color="#111" />;
        }
        return <Ionicons key={index} name="star-outline" size={12} color="#9CA3AF" />;
      })}
      <Text style={{ marginLeft: 4, fontSize: 11, color: '#111' }}>{RATING.toFixed(1)}</Text>
      <Text style={{ marginLeft: 6, fontSize: 11, color: '#111' }}>({REVIEW_COUNT})</Text>
    </View>
  );
}
