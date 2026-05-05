import { isPaymentGatewayHost } from './paymentGateways';

describe('isPaymentGatewayHost', () => {
  it('matches exact gateway hosts', () => {
    expect(isPaymentGatewayHost('tap.company')).toBe(true);
    expect(isPaymentGatewayHost('hyperpay.com')).toBe(true);
    expect(isPaymentGatewayHost('tabby.ai')).toBe(true);
    expect(isPaymentGatewayHost('tamara.co')).toBe(true);
  });

  it('matches subdomains via suffix', () => {
    expect(isPaymentGatewayHost('payments.tap.company')).toBe(true);
    expect(isPaymentGatewayHost('eu-prod.oppwa.com')).toBe(true);
    expect(isPaymentGatewayHost('api.tabby.ai')).toBe(true);
  });

  it('rejects non-gateway hosts even when they share a substring', () => {
    expect(isPaymentGatewayHost('not-tap.company.evil.com')).toBe(false);
    expect(isPaymentGatewayHost('evil-tap.company')).toBe(false);
    expect(isPaymentGatewayHost('hyperpay.com.evil.com')).toBe(false);
    expect(isPaymentGatewayHost('tap-company.com')).toBe(false);
  });

  it('is case-insensitive on host', () => {
    expect(isPaymentGatewayHost('PAYMENTS.TAP.COMPANY')).toBe(true);
  });

  it('rejects unrelated hosts', () => {
    expect(isPaymentGatewayHost('www.dressfair.com')).toBe(false);
    expect(isPaymentGatewayHost('example.com')).toBe(false);
    expect(isPaymentGatewayHost('')).toBe(false);
  });
});
