import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  bottomInset: number;
  onSignInPress: () => void;
};

/** Mirrors Flutter [`home_screen.dart`](src/flutter-code/view/screens/home_screens/home_screen.dart) overlay above bottom nav (~40dp). */
export function GuestSignInBanner({ visible, bottomInset, onSignInPress }: Props) {
  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: bottomInset,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 8,
      }}
    >
      <Text style={{ color: '#FFF', fontSize: 13.5, flexShrink: 1 }} numberOfLines={1}>
        Sign In For The Best Experience
      </Text>
      <Pressable accessibilityRole="button" onPress={onSignInPress} style={{ backgroundColor: '#E56B2A', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 22 }}>
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 12 }}>Sign in</Text>
      </Pressable>
    </View>
  );
}
