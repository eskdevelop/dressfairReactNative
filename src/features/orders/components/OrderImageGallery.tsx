import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@app/theme/tokens';
import { ZoomableImage, type ImageTransform } from '@shared/ui/ZoomableImage';

import type { OrderProductImage } from '../types';

const SLIDER_HEIGHT = 300;
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

type Props = {
  images: OrderProductImage[];
};

type ToolbarButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function ToolbarButton({ icon, label, onPress }: ToolbarButtonProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 52,
        paddingVertical: 6,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.14)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text style={{ marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const DEFAULT_TRANSFORM: ImageTransform = {
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  scale: 1,
};

export function OrderImageGallery({ images }: Props): React.ReactElement | null {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fullscreenListRef = useRef<FlatList<OrderProductImage>>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM);

  const toolbarHeight = 88 + insets.bottom;
  const fullscreenImageHeight = Math.max(
    240,
    windowHeight - insets.top - toolbarHeight - 56,
  );

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, []);

  useEffect(() => {
    resetTransform();
  }, [viewerIndex, resetTransform]);

  const onSliderScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / Math.max(1, windowWidth));
      setActiveIndex(Math.max(0, Math.min(images.length - 1, page)));
    },
    [images.length, windowWidth],
  );

  const onViewerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / Math.max(1, windowWidth));
      setViewerIndex(Math.max(0, Math.min(images.length - 1, page)));
    },
    [images.length, windowWidth],
  );

  if (images.length === 0) return null;

  const openFullscreen = (index: number) => {
    setViewerIndex(index);
    setFullscreenOpen(true);
    resetTransform();
    requestAnimationFrame(() => {
      fullscreenListRef.current?.scrollToIndex({ index, animated: false });
    });
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
    resetTransform();
  };

  const rotateImage = () => {
    setTransform(prev => ({
      ...prev,
      rotation: ((prev.rotation ?? 0) + 90) % 360,
    }));
  };

  const flipHorizontal = () => {
    setTransform(prev => ({ ...prev, flipHorizontal: !prev.flipHorizontal }));
  };

  const flipVertical = () => {
    setTransform(prev => ({ ...prev, flipVertical: !prev.flipVertical }));
  };

  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(MAX_SCALE, +((prev.scale ?? 1) + SCALE_STEP).toFixed(2)),
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, +((prev.scale ?? 1) - SCALE_STEP).toFixed(2)),
    }));
  };

  const scaleLabel = `${Math.round((transform.scale ?? 1) * 100)}%`;

  return (
    <>
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => String(item.id ?? item.url ?? index)}
          onMomentumScrollEnd={onSliderScrollEnd}
          renderItem={({ item, index }) => (
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel={`Product image ${index + 1} of ${images.length}. Tap to enlarge.`}
              onPress={() => openFullscreen(index)}
              style={{ width: windowWidth, height: SLIDER_HEIGHT }}
            >
              <ZoomableImage
                uri={item.url}
                width={windowWidth}
                height={SLIDER_HEIGHT}
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                }}
              >
                <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                <Text style={{ marginLeft: 4, fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
                  Tap to enlarge
                </Text>
              </View>
            </Pressable>
          )}
        />

        {images.length > 1 ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
              gap: 6,
            }}
          >
            {images.map((img, index) => (
              <View
                key={String(img.id ?? img.url ?? index)}
                style={{
                  width: activeIndex === index ? 8 : 6,
                  height: activeIndex === index ? 8 : 6,
                  borderRadius: 4,
                  backgroundColor: activeIndex === index ? colors.brand : '#D1D5DB',
                }}
              />
            ))}
          </View>
        ) : (
          <View style={{ height: 8 }} />
        )}
      </View>

      <Modal
        visible={fullscreenOpen}
        animationType="fade"
        transparent
        onRequestClose={closeFullscreen}
      >
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: insets.top + 4,
              paddingHorizontal: 8,
              paddingBottom: 8,
              backgroundColor: 'rgba(0,0,0,0.85)',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={closeFullscreen}
              hitSlop={12}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 6,
                minWidth: 72,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              <Text style={{ marginLeft: 2, fontSize: 15, color: '#FFFFFF', fontWeight: '600' }}>
                Back
              </Text>
            </Pressable>

            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 14,
                color: '#FFFFFF',
                fontWeight: '600',
              }}
            >
              {viewerIndex + 1} / {images.length}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset image"
              onPress={resetTransform}
              hitSlop={12}
              style={{
                minWidth: 72,
                alignItems: 'flex-end',
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.brand, fontWeight: '600' }}>Reset</Text>
            </Pressable>
          </View>

          <FlatList
            ref={fullscreenListRef}
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: windowWidth,
              offset: windowWidth * index,
              index,
            })}
            onMomentumScrollEnd={onViewerScrollEnd}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `fs-${String(item.id ?? item.url ?? index)}`}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: windowWidth,
                  height: fullscreenImageHeight,
                  justifyContent: 'center',
                }}
              >
                <ZoomableImage
                  uri={item.url}
                  width={windowWidth}
                  height={fullscreenImageHeight}
                  maxZoom={5}
                  transform={index === viewerIndex ? transform : undefined}
                />
              </View>
            )}
          />

          <View
            style={{
              paddingTop: 10,
              paddingBottom: insets.bottom + 10,
              paddingHorizontal: 4,
              backgroundColor: 'rgba(0,0,0,0.9)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
              }}
            >
              <ToolbarButton icon="refresh-outline" label="Rotate" onPress={rotateImage} />
              <ToolbarButton icon="swap-horizontal-outline" label="Flip H" onPress={flipHorizontal} />
              <ToolbarButton icon="swap-vertical-outline" label="Flip V" onPress={flipVertical} />
              <ToolbarButton icon="remove-outline" label="Zoom out" onPress={zoomOut} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Zoom level ${scaleLabel}`}
                onPress={resetTransform}
                style={{ alignItems: 'center', justifyContent: 'center', minWidth: 52, paddingVertical: 6 }}
              >
                <View
                  style={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '700' }}>{scaleLabel}</Text>
                </View>
                <Text style={{ marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
                  Scale
                </Text>
              </Pressable>
              <ToolbarButton icon="add-outline" label="Zoom in" onPress={zoomIn} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
