import {
  checkShipping,
  selectedDiscount,
  selectedTotalNormalPrice,
  selectedTotalPrice,
  totalWithShippingCharges,
} from './cartPricing';
import { parseWebCartItems } from './parseWebCartItems';
import type { CartLineItem } from './cartTypes';

describe('cartPricing', () => {
  const items: CartLineItem[] = parseWebCartItems([
    { id: 1, product_option_id: 1, sku: 'A', name: 'A', quantity: 2, price: 39, normal_price: 75 },
    { id: 2, product_option_id: 2, sku: 'B', name: 'B', quantity: 1, price: 79, normal_price: 79 },
  ]);

  it('matches Flutter selected totals (unit price × qty)', () => {
    expect(selectedTotalPrice(items)).toBe(39 * 2 + 79);
    expect(selectedTotalNormalPrice(items)).toBe(75 * 2 + 79);
    expect(selectedDiscount(items)).toBe(75 * 2 + 79 - (39 * 2 + 79));
  });

  it('matches Flutter shipping rules', () => {
    const config = { shippingAmount: 15, freeShippingLimit: 200 };
    expect(checkShipping(157, config)).toBe(15);
    expect(checkShipping(200, config)).toBe(0);
    expect(totalWithShippingCharges(157, config)).toBe(172);
    // Flutter `totalWithShippingCharges` uses `<=` so at exactly the limit shipping is still added.
    expect(totalWithShippingCharges(200, config)).toBe(215);
  });

  it('free shipping when shipping amount is zero', () => {
    const config = { shippingAmount: 0, freeShippingLimit: 200 };
    expect(checkShipping(50, config)).toBe(0);
    expect(totalWithShippingCharges(50, config)).toBe(50);
  });
});
