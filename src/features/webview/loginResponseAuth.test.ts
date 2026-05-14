import {
  extractCustomerTokenFromLoginResponse,
  looksLikeCustomerLoginRequestUrl,
} from './loginResponseAuth';

describe('extractCustomerTokenFromLoginResponse', () => {
  it('returns the token for a typical success payload', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature';
    const raw = JSON.stringify({
      success: true,
      message: 'Login successful',
      token,
      customer: { id: 1 },
    });
    expect(extractCustomerTokenFromLoginResponse(raw)).toBe(token);
  });

  it('accepts string/number truthy success flags', () => {
    const token = 'x'.repeat(20);
    expect(
      extractCustomerTokenFromLoginResponse(JSON.stringify({ success: 'true', token })),
    ).toBe(token);
    expect(
      extractCustomerTokenFromLoginResponse(JSON.stringify({ success: '1', token })),
    ).toBe(token);
    expect(
      extractCustomerTokenFromLoginResponse(JSON.stringify({ success: 1, token })),
    ).toBe(token);
  });

  it('returns null when success is false or token missing', () => {
    expect(extractCustomerTokenFromLoginResponse(JSON.stringify({ success: false, token: 'y'.repeat(20) }))).toBeNull();
    expect(extractCustomerTokenFromLoginResponse(JSON.stringify({ success: true }))).toBeNull();
    expect(extractCustomerTokenFromLoginResponse(JSON.stringify({ success: true, token: 'short' }))).toBeNull();
  });

  it('returns null on invalid JSON', () => {
    expect(extractCustomerTokenFromLoginResponse('not-json')).toBeNull();
  });
});

describe('looksLikeCustomerLoginRequestUrl', () => {
  it('matches storefront login API paths', () => {
    expect(
      looksLikeCustomerLoginRequestUrl(
        'https://9711694.ecomplug.com/api/rest/store/checkout/customer/login',
      ),
    ).toBe(true);
  });

  it('rejects unrelated URLs', () => {
    expect(looksLikeCustomerLoginRequestUrl('https://example.com/login')).toBe(false);
    expect(looksLikeCustomerLoginRequestUrl('')).toBe(false);
  });
});
