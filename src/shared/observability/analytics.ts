type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const analytics = {
  track(event: string, payload?: AnalyticsPayload) {
    if (!isDev) return;
    console.log('[analytics]', event, payload);
  },
};
