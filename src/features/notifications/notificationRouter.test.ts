import { mapIncomingUrlToWebPath, mapPayloadToWebPath } from './notificationRouter';

describe('mapPayloadToWebPath', () => {
  it('maps a clean web_route payload to its path', () => {
    expect(mapPayloadToWebPath({ type: 'web_route', path: '/p/dress-1' })).toBe(
      '/p/dress-1',
    );
  });

  it('preserves the query string', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: '/search?q=red' }),
    ).toBe('/search?q=red');
  });

  it('falls back to home for unknown payload types', () => {
    expect(mapPayloadToWebPath({ type: 'promo' })).toBe('/');
  });

  it('rejects undefined and missing paths', () => {
    expect(mapPayloadToWebPath()).toBe('/');
    expect(mapPayloadToWebPath({ type: 'web_route' })).toBe('/');
  });

  it('rejects protocol-relative paths that smuggle a host', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: '//evil.com/order/1' }),
    ).toBe('/');
  });

  it('rejects backslash-prefixed paths', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: '\\\\evil.com/order/1' }),
    ).toBe('/');
  });

  it('rejects absolute URLs in the path field', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: 'https://evil.com/x' }),
    ).toBe('/');
  });

  it('rejects paths containing control characters', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: '/order\u0000/1' }),
    ).toBe('/');
  });

  it('keeps percent-encoded segments that resolve to the storefront', () => {
    expect(
      mapPayloadToWebPath({ type: 'web_route', path: '/p/red%20dress' }),
    ).toBe('/p/red%20dress');
  });
});

describe('mapIncomingUrlToWebPath', () => {
  it('maps the custom dressfair:// scheme', () => {
    expect(mapIncomingUrlToWebPath('dressfair://web?path=/order/123')).toBe(
      '/order/123',
    );
  });

  it('rejects dressfair:// payloads with a smuggled host', () => {
    expect(mapIncomingUrlToWebPath('dressfair://web?path=//evil.com/x')).toBe('/');
    expect(
      mapIncomingUrlToWebPath('dressfair://web?path=https://evil.com/x'),
    ).toBe('/');
  });

  it('passes through allowed universal links', () => {
    expect(mapIncomingUrlToWebPath('https://www.dressfair.com/p/dress-1')).toBe(
      '/p/dress-1',
    );
  });

  it('blocks universal links to non-allowed hosts', () => {
    expect(mapIncomingUrlToWebPath('https://evil.com/p/1')).toBe('/');
  });

  it('blocks non-https universal links', () => {
    expect(mapIncomingUrlToWebPath('http://www.dressfair.com/p/1')).toBe('/');
  });

  it('falls back home for empty and malformed inputs', () => {
    expect(mapIncomingUrlToWebPath(null)).toBe('/');
    expect(mapIncomingUrlToWebPath(undefined)).toBe('/');
    expect(mapIncomingUrlToWebPath('not-a-url')).toBe('/');
  });
});
