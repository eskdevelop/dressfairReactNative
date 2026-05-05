jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

import * as Linking from 'expo-linking';
import { isAllowedExternalScheme, safeOpenExternalUrl } from './externalLinks';

const openURLMock = Linking.openURL as jest.MockedFunction<typeof Linking.openURL>;

describe('isAllowedExternalScheme', () => {
  it('accepts allow-listed schemes', () => {
    expect(isAllowedExternalScheme('https://example.com')).toBe(true);
    expect(isAllowedExternalScheme('mailto:hi@example.com')).toBe(true);
    expect(isAllowedExternalScheme('tel:+97150000000')).toBe(true);
    expect(isAllowedExternalScheme('sms:+97150000000')).toBe(true);
  });

  it('rejects dangerous and unknown schemes', () => {
    expect(isAllowedExternalScheme('javascript:alert(1)')).toBe(false);
    expect(isAllowedExternalScheme('intent://foo#Intent;scheme=evil;end')).toBe(false);
    expect(isAllowedExternalScheme('file:///etc/passwd')).toBe(false);
    expect(isAllowedExternalScheme('content://com.android.contacts')).toBe(false);
    expect(isAllowedExternalScheme('market://details?id=evil')).toBe(false);
    expect(isAllowedExternalScheme('http://insecure.example')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isAllowedExternalScheme('not-a-url')).toBe(false);
    expect(isAllowedExternalScheme('')).toBe(false);
  });
});

describe('safeOpenExternalUrl', () => {
  beforeEach(() => {
    openURLMock.mockClear();
    openURLMock.mockResolvedValue(true);
  });

  it('opens allow-listed URLs', async () => {
    await expect(safeOpenExternalUrl('https://example.com')).resolves.toBe(true);
    expect(openURLMock).toHaveBeenCalledWith('https://example.com');
  });

  it('does not open disallowed schemes', async () => {
    await expect(safeOpenExternalUrl('javascript:alert(1)')).resolves.toBe(false);
    expect(openURLMock).not.toHaveBeenCalled();
  });

  it('returns false when Linking rejects', async () => {
    openURLMock.mockRejectedValueOnce(new Error('boom'));
    await expect(safeOpenExternalUrl('https://example.com')).resolves.toBe(false);
  });
});
