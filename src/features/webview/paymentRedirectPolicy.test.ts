import { detectPaymentRedirect } from './paymentRedirectPolicy';

describe('payment redirect policy', () => {
  it('detects success callbacks', () => {
    const result = detectPaymentRedirect(
      'https://www.dressfair.com/checkout/success?order_id=123',
    );
    expect(result.isPaymentCallback).toBe(true);
    expect(result.status).toBe('success');
  });

  it('detects failed callbacks', () => {
    const result = detectPaymentRedirect(
      'https://www.dressfair.com/payment/failure?reason=declined',
    );
    expect(result.isPaymentCallback).toBe(true);
    expect(result.status).toBe('failed');
  });

  it('ignores non-payment pages', () => {
    const result = detectPaymentRedirect('https://www.dressfair.com/p/dress-1');
    expect(result.isPaymentCallback).toBe(false);
  });
});
