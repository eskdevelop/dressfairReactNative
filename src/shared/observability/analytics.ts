import type { AnalyticsPayload } from './transport';
import { forwardAnalyticsEvent } from './transport';

export type { AnalyticsPayload } from './transport';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const analytics = {
  track(event: string, payload?: AnalyticsPayload) {
    if (isDev) {
      console.log('[analytics]', event, payload);
    }
    // Always forward to the registered transport so production builds can
    // ship security/payment telemetry to the team's analytics backend.
    forwardAnalyticsEvent(event, payload);
  },
};
