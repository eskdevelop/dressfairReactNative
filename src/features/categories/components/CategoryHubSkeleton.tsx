import React from 'react';
import { ScrollView, View } from 'react-native';

import { categoryTheme } from '@features/categories/categoryTheme';
import { SkeletonBox } from '@shared/ui/SkeletonBox';

const SIDEBAR_ROW_WIDTHS = [0.72, 0.58, 0.8, 0.65, 0.74, 0.55, 0.68, 0.76, 0.62, 0.7] as const;

type Props = {
  sidebarWidth: number;
  cellWidth: number;
  subColGap: number;
  relatedCardW: number;
  relatedImgH: number;
  relGap: number;
  relPad: number;
};

function RelatedProductSkeletonCard({
  cardWidth,
  imageHeight,
}: {
  cardWidth: number;
  imageHeight: number;
}): React.ReactElement {
  return (
    <View style={{ width: cardWidth, marginHorizontal: 3, overflow: 'hidden' }}>
      <SkeletonBox width="100%" height={imageHeight} borderRadius={0} />
      <SkeletonBox width="88%" height={10} borderRadius={4} style={{ marginTop: 6 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={6} height={6} borderRadius={3} />
        ))}
        <SkeletonBox width={20} height={8} borderRadius={4} />
      </View>
      <SkeletonBox width="42%" height={10} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}

/** Category hub layout skeleton — sidebar + subcategory grid + related products. */
export function CategoryHubSkeleton({
  sidebarWidth,
  cellWidth,
  subColGap,
  relatedCardW,
  relatedImgH,
  relGap,
  relPad,
}: Props): React.ReactElement {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{
          width: sidebarWidth,
          backgroundColor: categoryTheme.sidebarBg,
          borderRightWidth: 0.4,
          borderRightColor: categoryTheme.sidebarBorder,
        }}
      >
        {SIDEBAR_ROW_WIDTHS.map((widthRatio, idx) => (
          <View
            key={`sidebar-row-${idx}`}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 10,
              backgroundColor: idx === 0 ? '#FFF' : 'transparent',
            }}
          >
            <SkeletonBox
              width={Math.max(24, sidebarWidth * widthRatio * 0.85)}
              height={10}
              borderRadius={4}
            />
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        <SkeletonBox
          width={130}
          height={14}
          borderRadius={4}
          style={{ marginHorizontal: 8, marginTop: 8 }}
        />

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            marginTop: 8,
            paddingHorizontal: 6,
            columnGap: subColGap,
            rowGap: 12,
          }}
        >
          {Array.from({ length: 9 }, (_, idx) => (
            <View key={`subcell-${idx}`} style={{ width: cellWidth, alignItems: 'center' }}>
              <SkeletonBox width={58} height={58} borderRadius={29} />
              <SkeletonBox
                width={Math.max(32, cellWidth * 0.7)}
                height={8}
                borderRadius={4}
                style={{ marginTop: 10 }}
              />
            </View>
          ))}
        </View>

        <SkeletonBox
          width={120}
          height={14}
          borderRadius={4}
          style={{ marginHorizontal: 8, marginTop: 16 }}
        />

        <View style={{ paddingHorizontal: relPad, paddingTop: 8, gap: relGap }}>
          {Array.from({ length: 3 }, (_, rowIdx) => (
            <View key={`related-row-${rowIdx}`} style={{ flexDirection: 'row', gap: relGap }}>
              <RelatedProductSkeletonCard cardWidth={relatedCardW} imageHeight={relatedImgH} />
              <RelatedProductSkeletonCard cardWidth={relatedCardW} imageHeight={relatedImgH} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
