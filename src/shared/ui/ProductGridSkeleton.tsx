import React from 'react';
import { View } from 'react-native';

import { SkeletonBox } from '@shared/ui/SkeletonBox';

type Props = {
  cardW: number;
  cardH: number;
  rows?: number;
  gap?: number;
};

function ProductGridSkeletonCard({ cardW, cardH }: { cardW: number; cardH: number }): React.ReactElement {
  return (
    <View style={{ flex: 1, maxWidth: cardW, backgroundColor: '#FFF' }}>
      <SkeletonBox width="100%" height={cardH} borderRadius={6} />
      <SkeletonBox width="90%" height={10} borderRadius={4} style={{ marginTop: 4, marginHorizontal: 3 }} />
      <SkeletonBox width="70%" height={10} borderRadius={4} style={{ marginTop: 3, marginHorizontal: 3 }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          paddingHorizontal: 2,
          paddingTop: 4,
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={6} height={6} borderRadius={3} />
        ))}
        <SkeletonBox width={18} height={8} borderRadius={4} />
        <SkeletonBox width={14} height={8} borderRadius={4} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 3,
          paddingTop: 4,
          paddingBottom: 2,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <SkeletonBox width="45%" height={10} borderRadius={4} />
          <SkeletonBox width="25%" height={8} borderRadius={4} />
        </View>
        <SkeletonBox width={36} height={26} borderRadius={13} />
      </View>
    </View>
  );
}

/** Two-column product grid skeleton — matches `CartNewArrivalProductTile` layout. */
export function ProductGridSkeleton({
  cardW,
  cardH,
  rows = 3,
  gap = 4,
}: Props): React.ReactElement {
  return (
    <View>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <View
          key={`skeleton-row-${rowIdx}`}
          style={{ flexDirection: 'row', marginBottom: gap, gap }}
        >
          <ProductGridSkeletonCard cardW={cardW} cardH={cardH} />
          <ProductGridSkeletonCard cardW={cardW} cardH={cardH} />
        </View>
      ))}
    </View>
  );
}
