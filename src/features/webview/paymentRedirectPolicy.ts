type PaymentRedirectResult = {
  isPaymentCallback: boolean;
  status: 'success' | 'failed' | 'pending' | 'unknown';
};

const includesAny = (value: string, keys: string[]): boolean =>
  keys.some(key => value.includes(key));

export const detectPaymentRedirect = (url: string): PaymentRedirectResult => {
  const lowered = url.toLowerCase();
  const isPaymentCallback = includesAny(lowered, [
    'checkout',
    'payment',
    'success',
    'failure',
    'callback',
    '3ds',
    'return',
  ]);

  if (!isPaymentCallback) {
    return { isPaymentCallback: false, status: 'unknown' };
  }

  if (includesAny(lowered, ['success', 'paid', 'completed'])) {
    return { isPaymentCallback: true, status: 'success' };
  }
  if (includesAny(lowered, ['failed', 'failure', 'cancel', 'declined', 'error'])) {
    return { isPaymentCallback: true, status: 'failed' };
  }
  if (includesAny(lowered, ['pending', 'processing'])) {
    return { isPaymentCallback: true, status: 'pending' };
  }
  return { isPaymentCallback: true, status: 'unknown' };
};
