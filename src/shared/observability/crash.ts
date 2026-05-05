import type { CrashContext } from './transport';
import { forwardCrashEvent } from './transport';

export type { CrashContext } from './transport';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const crashReporter = {
  capture(error: unknown, context?: CrashContext) {
    if (isDev) {
      console.error('[crash]', error, context);
    }
    forwardCrashEvent(error, context);
  },
};
