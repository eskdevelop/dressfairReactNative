import React, { Suspense } from 'react';

type ScreenModule<P> = { default: React.ComponentType<P> } | React.ComponentType<P>;

/**
 * Defers stack screen modules until first navigation. No visible fallback — each
 * screen keeps its own skeleton/loading UI once mounted.
 */
export function lazyScreen<P extends object>(
  loader: () => Promise<ScreenModule<P>>,
): React.ComponentType<P> {
  const Lazy = React.lazy(async () => {
    const mod = await loader();
    if (typeof mod === 'function') {
      return { default: mod as React.ComponentType<P> };
    }
    return mod;
  });

  function LazyScreen(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  }

  return LazyScreen;
}
