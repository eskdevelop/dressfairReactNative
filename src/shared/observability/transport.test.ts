import { analytics } from './analytics';
import { crashReporter } from './crash';
import { setObservabilityTransport } from './transport';

describe('observability transport', () => {
  afterEach(() => {
    setObservabilityTransport(null);
  });

  it('buffers events and flushes them on transport registration', () => {
    setObservabilityTransport(null);
    analytics.track('event_a', { foo: 1 });
    analytics.track('event_b');
    crashReporter.capture(new Error('bootstrap-failed'), { source: 'unit' });

    const trackEvent = jest.fn();
    const captureError = jest.fn();
    setObservabilityTransport({ trackEvent, captureError });

    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'event_a', { foo: 1 });
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'event_b', undefined);
    expect(captureError).toHaveBeenCalledTimes(1);
  });

  it('forwards events live once transport is registered', () => {
    const trackEvent = jest.fn();
    const captureError = jest.fn();
    setObservabilityTransport({ trackEvent, captureError });

    analytics.track('live', { ok: true });
    crashReporter.capture('boom');

    expect(trackEvent).toHaveBeenCalledWith('live', { ok: true });
    expect(captureError).toHaveBeenCalledWith('boom', undefined);
  });

  it('caps the buffer to avoid unbounded memory growth', () => {
    setObservabilityTransport(null);
    for (let i = 0; i < 250; i += 1) {
      analytics.track(`evt_${i}`);
    }
    const trackEvent = jest.fn();
    setObservabilityTransport({ trackEvent });
    // Buffer is capped at 100; the most recent events survive.
    expect(trackEvent).toHaveBeenCalledTimes(100);
    expect(trackEvent).toHaveBeenNthCalledWith(100, 'evt_249', undefined);
  });
});
