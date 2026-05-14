import axios from 'axios';

import { clearStoredUserSession } from '@features/auth/authSync';
import { analytics } from '@shared/observability/analytics';

export async function withStorefrontUnauthorizedClear<T>(
  telemetryKey: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      analytics.track(telemetryKey);
      await clearStoredUserSession();
    }
    throw error;
  }
}
