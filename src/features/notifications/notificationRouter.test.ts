import { mapIncomingUrlToWebPath, mapPayloadToWebPath } from './notificationRouter';

describe('notification router', () => {
  it('maps web route payload to path', () => {
    expect(mapPayloadToWebPath({ type: 'web_route', path: '/p/dress-1' })).toBe(
      '/p/dress-1',
    );
  });

  it('falls back to home for unknown payload', () => {
    expect(mapPayloadToWebPath({ type: 'promo' })).toBe('/');
  });

  it('maps custom scheme deeplink path', () => {
    expect(mapIncomingUrlToWebPath('dressfair://web?path=/order/123')).toBe(
      '/order/123',
    );
  });

  it('blocks non-allowed hosts for universal link', () => {
    expect(mapIncomingUrlToWebPath('https://evil.com/p/1')).toBe('/');
  });
});
