import { withRetry } from './retry';

describe('withRetry', () => {
  it('retries then succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw { statusCode: 500, message: 'temporary' };
        }
        return 'ok';
      },
      { retries: 4, baseDelayMs: 1, maxDelayMs: 1 },
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('stops retrying on non-retriable status', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw { statusCode: 400, message: 'bad request' };
        },
        { retries: 5, baseDelayMs: 1, maxDelayMs: 1 },
      ),
    ).rejects.toBeTruthy();
    expect(attempts).toBe(1);
  });
});
