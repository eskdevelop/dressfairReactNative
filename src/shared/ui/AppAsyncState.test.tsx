import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { AppAsyncState } from './AppAsyncState';

describe('AppAsyncState', () => {
  it('renders loader state', () => {
    const screen = render(
      <AppAsyncState isLoading>
        <Text>Child</Text>
      </AppAsyncState>,
    );
    expect(screen.queryByText('Child')).toBeNull();
  });

  it('renders error message', () => {
    const screen = render(
      <AppAsyncState errorMessage="Failed to load">
        <Text>Child</Text>
      </AppAsyncState>,
    );
    expect(screen.getByText('Failed to load')).toBeTruthy();
  });

  it('renders child on success', () => {
    const screen = render(
      <AppAsyncState>
        <Text>Child</Text>
      </AppAsyncState>,
    );
    expect(screen.getByText('Child')).toBeTruthy();
  });
});
