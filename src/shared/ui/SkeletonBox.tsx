import React from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonShimmer } from '@shared/ui/SkeletonShimmer';

type Props = {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function SkeletonBox({
  width = '100%',
  height,
  borderRadius = 4,
  shimmer = true,
  style,
}:Props):React.ReactElement {
  const boxStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: '#E5E7EB',
  };

  if (!shimmer) {
    return <View style={[boxStyle, style]} />;
  }

  return (
    <SkeletonShimmer style={[boxStyle, style]}>
      <View style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB' }} />
    </SkeletonShimmer>
  );
}
