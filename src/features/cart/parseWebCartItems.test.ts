import { parseWebCartItems, cartTotalQuantity, cartSubtotal, cartLineKey } from './parseWebCartItems';

describe('parseWebCartItems', () => {
  it('maps dressfair.com localStorage.cart rows', () => {
    const items = parseWebCartItems([
      {
        id: 2919,
        product_option_id: 10096,
        sku: 'C-1166-Pink',
        name: 'Women Two Piece Suit',
        quantity: 2,
        price: 79,
        size: 'M',
        color: 'Pink',
        image: '9711694/product.jpg',
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].lineKey).toBe(cartLineKey('C-1166-Pink', 10096));
    expect(items[0].productId).toBe(2919);
    expect(items[0].quantity).toBe(2);
    expect(items[0].price).toBe(79);
    expect(items[0].isSelected).toBe(true);
    expect(items[0].size).toBe('M');
  });

  it('parses compare-at price and discount', () => {
    const items = parseWebCartItems([
      {
        id: 1,
        product_option_id: 2,
        sku: 'A',
        name: 'Dress',
        quantity: 1,
        price: 40,
        normal_price: 75,
      },
    ]);
    expect(items[0].normalPrice).toBe(75);
    expect(items[0].discountPercent).toBe(47);
  });

  it('returns empty for invalid input', () => {
    expect(parseWebCartItems(null)).toEqual([]);
    expect(parseWebCartItems([{ sku: '' }])).toEqual([]);
  });

  it('computes totals', () => {
    const items = parseWebCartItems([
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 2, price: 10 },
    ]);
    expect(cartTotalQuantity(items)).toBe(2);
    expect(cartSubtotal(items)).toBe(20);
  });
});
