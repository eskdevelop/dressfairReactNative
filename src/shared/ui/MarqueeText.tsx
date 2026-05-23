import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** Flutter Marquee `velocity` — px per second. */
  /// Flutter Marque px per seconde. */
  speed?: number;
  /** Flutter Marquee `blankSpace`. */
  gap?: number;
  /** Flutter Marquee `pauseAfterRound`. */
  pauseMs?: number;
  /** Flutter Marquee `startPadding`. */
  startPadding?: number;
};

export function MarqueeText({
  text,
  style,
  containerStyle,
  speed = 50,
  gap = 50,
  pauseMs = 1000,
  startPadding = 10,
}: Props): React.ReactElement {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const onMeasureLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTextWidth(w);
  }, []);

  const segment = textWidth + gap;
  const ready = textWidth > 0;

  useEffect(() => {
    loopRef.current?.stop();
    translateX.setValue(startPadding);

    if (!ready || segment <= 0) return;

    const duration = Math.max(3000, (segment / speed) * 1000);
    const scroll = Animated.timing(translateX, {
      toValue: startPadding - segment,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    loopRef.current = Animated.loop(
      Animated.sequence([
        scroll,
        Animated.delay(pauseMs),
        Animated.timing(translateX, {
          toValue: startPadding,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [ready, segment, speed, pauseMs, startPadding, translateX]);

  const textStyle = StyleSheet.flatten([style, styles.singleLine]);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Unconstrained off-screen measure — one line, full width. */}
      <Text
        numberOfLines={1}
        style={[textStyle, styles.measureText]}
        onLayout={onMeasureLayout}
      >
        {text}
      </Text>

      {ready ? (
        <Animated.View
          style={[
            styles.track,
            {
              transform: [{ translateX }],
              paddingLeft: startPadding,
            },
          ]}
        >
          <Text numberOfLines={1} style={[textStyle, styles.segment]}>
            {text}
          </Text>
          <View style={{ width: gap }} />
          <Text numberOfLines={1} style={[textStyle, styles.segment]}>
            {text}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  singleLine: {
    flexShrink: 0,
    includeFontPadding: false,
  },
  measureText: {
    position: 'absolute',
    opacity: 0,
    top: -1000,
    left: 0,
    maxWidth: 10000,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flexShrink: 0,
  },
});
