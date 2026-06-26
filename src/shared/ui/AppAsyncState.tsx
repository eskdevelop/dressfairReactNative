import React from 'react';
import { View } from 'react-native';

import { AppEmptyView } from './AppEmptyView';
import { AppErrorView } from './AppErrorView';
import { AppLoader } from './AppLoader';

type Props = {
  isLoading?: boolean;
  errorMessage?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onRetry?: () => void;
  overlay?: boolean;
  /** Passed to {@link AppLoader} — false hides the logo (spinner-only overlay). */
  loaderShowLogo?: boolean;
  children: React.ReactNode;
};

export function AppAsyncState({
  isLoading,
  errorMessage,
  isEmpty,
  emptyTitle = 'No data available',
  emptySubtitle,
  onRetry,
  overlay = false,
  loaderShowLogo = true,
  children,
}: Props) {
  const containerStyle = overlay
    ? {
        position: 'absolute' as const,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2,
        backgroundColor: '#FFFFFF',
      }
    : { flex: 1 };

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <AppLoader showLogo={loaderShowLogo} />
      </View>
    );
  }
  if (errorMessage) {
    return (
      <View style={containerStyle}>
        <AppErrorView message={errorMessage} onRetry={onRetry} />
      </View>
    );
  }
  if (isEmpty) {
    return (
      <View style={containerStyle}>
        <AppEmptyView title={emptyTitle} subtitle={emptySubtitle} />
      </View>
    );
  }
  if (overlay) {
    return null;
  }
  return <View style={{ flex: 1 }}>{children}</View>;
}
