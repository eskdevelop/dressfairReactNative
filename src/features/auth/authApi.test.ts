import axios from 'axios';

import { sendWhatsAppOtp, verifyWhatsAppOtp } from './authApi';

jest.mock('axios');
jest.mock('@shared/network/storefrontAuthHeaders', () => ({
  buildStorefrontStorePublicHeaders: () => ({ Accept: 'application/json' }),
}));
jest.mock('@shared/config/storefrontUrls', () => ({
  storefrontCheckoutUrl: (path: string) =>
    `https://9711694.ecomplug.com/api/rest/store/checkout/${path}`,
  storefrontStoreUrl: (path: string) =>
    `https://9711694.ecomplug.com/api/rest/store/${path}`,
}));
jest.mock('@shared/observability/analytics', () => ({
  analytics: { track: jest.fn() },
}));
jest.mock('@shared/observability/crash', () => ({
  crashReporter: { capture: jest.fn() },
}));

const postMock = axios.post as jest.MockedFunction<typeof axios.post>;

describe('authApi whatsapp', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('sendWhatsAppOtp posts mobile_number', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    const result = await sendWhatsAppOtp('971501234567');
    expect(result.success).toBe(true);
    expect(postMock).toHaveBeenCalledWith(
      'https://9711694.ecomplug.com/api/rest/store/checkout/send/otp',
      { mobile_number: '971501234567' },
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('verifyWhatsAppOtp posts otp and phone from args', async () => {
    const token = 'x'.repeat(24);
    postMock.mockResolvedValueOnce({ data: { success: true, token } });
    const result = await verifyWhatsAppOtp('971501234567', '12345');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.token).toBe(token);
    }
    expect(postMock).toHaveBeenCalledWith(
      'https://9711694.ecomplug.com/api/rest/store/checkout/login/otp',
      { otp: '12345', mobile_number: '971501234567' },
      expect.any(Object),
    );
  });
});
