import { parseBridgeMessage } from './bridgeMessage';

describe('parseBridgeMessage', () => {
  it('accepts a well-formed auth payload', () => {
    const result = parseBridgeMessage(
      JSON.stringify({ type: 'auth', token: 'abc.def.ghi' }),
    );
    expect(result).toEqual({ type: 'auth', token: 'abc.def.ghi' });
  });

  it('accepts a well-formed logout payload', () => {
    expect(parseBridgeMessage(JSON.stringify({ type: 'logout' }))).toEqual({
      type: 'logout',
    });
  });

  it('accepts a well-formed open_external payload', () => {
    const result = parseBridgeMessage(
      JSON.stringify({ type: 'open_external', url: 'https://example.com' }),
    );
    expect(result).toEqual({ type: 'open_external', url: 'https://example.com' });
  });

  it('rejects auth payload with missing or empty token', () => {
    expect(parseBridgeMessage(JSON.stringify({ type: 'auth' }))).toBeNull();
    expect(parseBridgeMessage(JSON.stringify({ type: 'auth', token: '' }))).toBeNull();
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'auth', token: 12345 })),
    ).toBeNull();
  });

  it('rejects open_external payload without a url', () => {
    expect(parseBridgeMessage(JSON.stringify({ type: 'open_external' }))).toBeNull();
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'open_external', url: '' })),
    ).toBeNull();
  });

  it('rejects unknown message types', () => {
    expect(parseBridgeMessage(JSON.stringify({ type: 'pwn', token: 'x' }))).toBeNull();
    expect(parseBridgeMessage(JSON.stringify({ token: 'x' }))).toBeNull();
  });

  it('rejects non-string and malformed inputs', () => {
    expect(parseBridgeMessage(null)).toBeNull();
    expect(parseBridgeMessage(undefined)).toBeNull();
    expect(parseBridgeMessage('')).toBeNull();
    expect(parseBridgeMessage('not json')).toBeNull();
    expect(parseBridgeMessage(JSON.stringify('a string'))).toBeNull();
    expect(parseBridgeMessage(JSON.stringify(['a', 'b']))).toBeNull();
    expect(parseBridgeMessage(42 as unknown as string)).toBeNull();
  });

  it('rejects payloads larger than the size cap', () => {
    const huge = JSON.stringify({ type: 'auth', token: 'x'.repeat(20 * 1024) });
    expect(parseBridgeMessage(huge)).toBeNull();
  });

  it('accepts a well-formed browsing_history_layout payload', () => {
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'browsing_history_layout', has_items: true })),
    ).toEqual({ type: 'browsing_history_layout', has_items: true });
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'browsing_history_layout', has_items: false })),
    ).toEqual({ type: 'browsing_history_layout', has_items: false });
  });

  it('rejects browsing_history_layout payload without a boolean has_items', () => {
    expect(parseBridgeMessage(JSON.stringify({ type: 'browsing_history_layout' }))).toBeNull();
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'browsing_history_layout', has_items: 'yes' })),
    ).toBeNull();
    expect(
      parseBridgeMessage(JSON.stringify({ type: 'browsing_history_layout', has_items: 1 })),
    ).toBeNull();
  });
});
