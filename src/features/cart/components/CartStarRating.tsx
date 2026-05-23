import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RATING = 4.5;
const REVIEW_COUNT = 4;

export function CartStarRating(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
      {Array.from({ length: 5 }, (_, index) => {
        if (RATING >= index + 1) {
          return <Ionicons key={index} name="star" size={10} color="#F59E0B" />;
        }
        if (RATING > index && RATING < index + 1) {
          return <Ionicons key={index} name="star-half" size={10} color="#F59E0B" />;
        }
        return <Ionicons key={index} name="star-outline" size={10} color="#D1D5DB" />;
      })}
      <Text style={{ marginLeft: 3, fontSize: 10, color: '#6B7280' }}>{RATING.toFixed(1)}</Text>
      <Text style={{ marginLeft: 4, fontSize: 10, color: '#9CA3AF' }}>({REVIEW_COUNT})</Text>
    </View>
  );
}
