import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SHIMMER_BAND = 96;

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Subtle horizontal shimmer sweep for skeleton placeholders. */
export function SkeletonShimmer({ children, style }: Props): React.ReactElement {
  const translateX = useRef(new Animated.Value(-SHIMMER_BAND)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: 320,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [translateX]);

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SHIMMER_BAND, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}
