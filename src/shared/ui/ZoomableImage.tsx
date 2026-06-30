import React from 'react';
import { Image, Platform, ScrollView, type StyleProp, type ViewStyle } from 'react-native';

export type ImageTransform = {
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  scale?: number;
};

type Props = {
  uri: string;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  maxZoom?: number;
  transform?: ImageTransform;
};

function buildImageTransform(transform?: ImageTransform) {
  const rotation = transform?.rotation ?? 0;
  const flipH = transform?.flipHorizontal ?? false;
  const flipV = transform?.flipVertical ?? false;
  const scale = transform?.scale ?? 1;
  return [
    { scale },
    { rotate: `${rotation}deg` },
    { scaleX: flipH ? -1 : 1 },
    { scaleY: flipV ? -1 : 1 },
  ];
}

/**
 * Pinch-to-zoom image viewer. Uses native ScrollView zoom on iOS; on Android the
 * image still renders at full size without pinch (RN ScrollView zoom is iOS-only).
 * Optional `transform` applies rotate / flip / scale for toolbar controls.
 */
export function ZoomableImage({
  uri,
  width,
  height,
  style,
  maxZoom = 4,
  transform,
}: Props): React.ReactElement {
  const imageTransform = buildImageTransform(transform);

  return (
    <ScrollView
      style={[{ width, height, backgroundColor: '#111111' }, style]}
      contentContainerStyle={{ width, height, alignItems: 'center', justifyContent: 'center' }}
      maximumZoomScale={maxZoom}
      minimumZoomScale={1}
      centerContent
      bouncesZoom
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEnabled={Platform.OS === 'ios'}
      nestedScrollEnabled
    >
      <Image
        source={{ uri }}
        style={{ width, height, transform: imageTransform }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </ScrollView>
  );
}
