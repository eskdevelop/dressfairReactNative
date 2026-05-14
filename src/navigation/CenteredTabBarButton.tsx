import React from 'react';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

type Props = Parameters<NonNullable<BottomTabNavigationOptions['tabBarButton']>>[0];

/** Overrides RN BottomTabItem `justifyContent: flex-start` so icon+label sit centered vertically (Temu-like density). */
export function CenteredTabBarButton(props: Props) {
  const { style, ...rest } = props;
  return <PlatformPressable {...rest} style={[style, { justifyContent: 'center' }]} />;
}
