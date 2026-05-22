import { parseAuthResponse, parseRegisterResponse } from './parseAuthResponse';

describe('parseAuthResponse', () => {
  it('returns token on successful login payload', () => {
    const token = 'x'.repeat(24);
    const result = parseAuthResponse({
      success: true,
      token,
      customer: { id: 1, firstname: 'A', lastname: 'B' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.token).toBe(token);
      expect(result.customer?.firstname).toBe('A');
    }
  });

  it('returns failure with message', () => {
    const result = parseAuthResponse({ success: false, message: 'Invalid OTP' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe('Invalid OTP');
    }
  });

  it('extracts token from nested data envelope', () => {
    const token = 'y'.repeat(24);
    const result = parseAuthResponse({
      success: true,
      data: { token },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.token).toBe(token);
    }
  });
});

describe('parseRegisterResponse', () => {
  it('accepts success without token', () => {
    const result = parseRegisterResponse({ success: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.token).toBe('');
    }
  });
});
