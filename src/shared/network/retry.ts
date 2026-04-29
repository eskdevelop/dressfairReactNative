type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const retries = options?.retries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 400;
  const maxDelayMs = options?.maxDelayMs ?? 4_000;
  const shouldRetry =
    options?.shouldRetry ??
    ((error: unknown) => {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (!statusCode) return true;
      return statusCode >= 500 || statusCode === 429;
    });

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !shouldRetry(error, attempt)) {
        throw error;
      }
      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const jitter = Math.round(Math.random() * 0.2 * backoff);
      const delayMs = backoff + jitter;
      options?.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
}
