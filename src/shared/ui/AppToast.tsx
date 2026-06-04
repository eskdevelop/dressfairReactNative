import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@app/theme/tokens';

/**
 * Lightweight toast for cart feedback. Mount once per screen; call `show` from handlers.
 */
export function useAppToast(defaultBottomOffset = 108): {
  show: (message: string) => void;
  ToastHost: React.FC;
} {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomOffset = defaultBottomOffset;

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMessage(null);
    });
  }, [opacity]);

  const show = useCallback(
    (text: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(text);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null;
        hide();
      }, 2200);
    },
    [hide, opacity],
  );

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const ToastHost = useCallback(() => {
    if (!message) return null;
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.wrap,
          { bottom: bottomOffset, opacity },
        ]}
      >
        <View style={styles.pill}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Animated.View>
    );
  }, [bottomOffset, message, opacity]);

  return { show, ToastHost };
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 50,
  },
  pill: {
    maxWidth: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(17,24,39,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
