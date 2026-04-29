export const crashReporter = {
  capture(error: unknown, context?: Record<string, unknown>) {
    // Replace with Crashlytics/Sentry integration in production.
    console.error('[crash]', error, context);
  },
};
