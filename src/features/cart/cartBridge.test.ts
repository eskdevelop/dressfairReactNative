import { parseBridgeMessage } from '../webview/bridgeMessage';

describe('cart_snapshot bridge message', () => {
  it('parses cart_snapshot with items array', () => {
    const raw = JSON.stringify({
      type: 'cart_snapshot',
      items: [{ id: 1, product_option_id: 2, sku: 'X', name: 'Item', quantity: 1, price: 9 }],
      source: 'web_localStorage',
    });
    const msg = parseBridgeMessage(raw);
    expect(msg?.type).toBe('cart_snapshot');
    if (msg?.type === 'cart_snapshot') {
      expect(msg.items).toHaveLength(1);
      expect(msg.source).toBe('web_localStorage');
    }
  });
});
