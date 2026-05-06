// #region agent log
// Temporary instrumentation for debug session 09dba4 (startup white-screen).
// REMOVE this file once the issue is fixed and verified.
const g = globalThis as unknown as { __DEBUG_T0?: number };
if (!g.__DEBUG_T0) {
  g.__DEBUG_T0 = Date.now();
}

const SERVER =
  'http://127.0.0.1:7673/ingest/500e7903-93fe-4a97-92e6-14fc672dea66';
const SESSION = '09dba4';

export const debugStartupLog = (
  location: string,
  message: string,
  data: Record<string, unknown> = {},
  hypothesisId?: string,
  runId?: string,
): void => {
  const t0 = g.__DEBUG_T0 ?? Date.now();
  const tSinceJsStart = Date.now() - t0;
  const payload = {
    sessionId: SESSION,
    location,
    message,
    data: { ...data, tSinceJsStart },
    timestamp: Date.now(),
    hypothesisId,
    runId,
  };
  // logcat-visible (ReactNativeJS tag) so we can capture even if fetch fails
  // in release builds where cleartext to localhost is blocked.
  // eslint-disable-next-line no-console
  console.warn(`[DRESSFAIR_DEBUG] ${message} ${JSON.stringify(payload)}`);
  fetch(SERVER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
// #endregion
