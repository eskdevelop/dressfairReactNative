// Pluggable observability transports. The app always emits to the console
// in __DEV__ for fast iteration, and additionally forwards every event to
// any transport registered via `setObservabilityTransport`. Production builds
// should register a real transport (Sentry, PostHog, your own backend, …)
// from `App.tsx` / `installObservability()` once the provider is chosen.
//
// Until a transport is registered, prod events are buffered (capped) so the
// first batch after registration still ships. This avoids the previous
// behaviour where production analytics were silently dropped.

export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export type CrashContext = Record<string, unknown>;

export type ObservabilityTransport = {
  trackEvent?: (event: string, payload?: AnalyticsPayload) => void;
  captureError?: (error: unknown, context?: CrashContext) => void;
};

type BufferedAnalytics = {
  kind: 'event';
  event: string;
  payload?: AnalyticsPayload;
};

type BufferedCrash = {
  kind: 'crash';
  error: unknown;
  context?: CrashContext;
};

type BufferedItem = BufferedAnalytics | BufferedCrash;

const BUFFER_LIMIT = 100;

let transport: ObservabilityTransport | null = null;
const buffer: BufferedItem[] = [];

const pushBuffer = (item: BufferedItem) => {
  buffer.push(item);
  if (buffer.length > BUFFER_LIMIT) {
    buffer.splice(0, buffer.length - BUFFER_LIMIT);
  }
};

export const setObservabilityTransport = (
  next: ObservabilityTransport | null,
): void => {
  transport = next;
  if (!transport) return;
  while (buffer.length > 0) {
    const item = buffer.shift();
    if (!item) break;
    if (item.kind === 'event') {
      transport.trackEvent?.(item.event, item.payload);
    } else {
      transport.captureError?.(item.error, item.context);
    }
  }
};

export const forwardAnalyticsEvent = (
  event: string,
  payload?: AnalyticsPayload,
): void => {
  if (transport?.trackEvent) {
    transport.trackEvent(event, payload);
    return;
  }
  pushBuffer({ kind: 'event', event, payload });
};

export const forwardCrashEvent = (
  error: unknown,
  context?: CrashContext,
): void => {
  if (transport?.captureError) {
    transport.captureError(error, context);
    return;
  }
  pushBuffer({ kind: 'crash', error, context });
};
