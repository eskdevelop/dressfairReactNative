import {
  availableQuantityFromProductDetail,
  availableQuantityFromWebItem,
  clampCartQuantity,
  evaluateCartQuantityChange,
  isCartLineUnavailable,
  partitionCartLinesByStock,
  presetQuantityOptions,
} from './cartStock';
import type { CartLineItem } from './cartTypes';
import type { ProductDetail } from '@features/categories/productDetailApi';

const baseDetail = (overrides: Partial<ProductDetail> = {}): ProductDetail => ({
  productId: 1,
  productGroupId: 1,
  availableQty: 10,
  sku: 'SKU-1',
  currencyCode: 'AED',
  name: 'Dress',
  color: 'Red',
  price: {
    normalPrice: 50,
    hasSale: false,
    hasOffer: false,
    hasBundle: false,
    hasNormal: true,
  },
  images: [],
  sizeOptions: [
    {
      productOptionId: 2,
      optionId: 1,
      optionName: 'Size',
      label: 'M',
      availableQuantity: 3,
    },
  ],
  colorOptions: [],
  ...overrides,
});

describe('cartStock', () => {
  it('reads available_quantity from web cart rows', () => {
    expect(availableQuantityFromWebItem({ available_quantity: 4 })).toBe(4);
    expect(availableQuantityFromWebItem({})).toBeNull();
  });

  it('uses size option stock when product_option_id is set', () => {
    expect(availableQuantityFromProductDetail(baseDetail(), 2)).toBe(3);
    expect(availableQuantityFromProductDetail(baseDetail(), 0)).toBe(10);
  });

  it('clamps requested quantity to available stock', () => {
    expect(clampCartQuantity(6, 3)).toBe(3);
    expect(clampCartQuantity(0, 5)).toBe(1);
  });

  it('builds dropdown presets up to min(5, available)', () => {
    expect(presetQuantityOptions(3)).toEqual([1, 2, 3]);
    expect(presetQuantityOptions(8)).toEqual([1, 2, 3, 4, 5]);
  });

  it('marks unavailable when stock is zero', () => {
    expect(isCartLineUnavailable(0, true)).toBe(true);
    expect(isCartLineUnavailable(0, false)).toBe(false);
    expect(isCartLineUnavailable(3, true)).toBe(false);
  });

  it('partitions cart lines into available and unavailable', () => {
    const items: CartLineItem[] = [
      {
        lineKey: 'A::1',
        productId: 1,
        productOptionId: 1,
        sku: 'A',
        name: 'In stock',
        quantity: 2,
        price: 10,
        isSelected: true,
        web: {},
      },
      {
        lineKey: 'B::2',
        productId: 2,
        productOptionId: 2,
        sku: 'B',
        name: 'Out of stock',
        quantity: 1,
        price: 20,
        isSelected: true,
        web: {},
      },
    ];
    const { available, unavailable } = partitionCartLinesByStock(items, {
      'A::1': 5,
      'B::2': 0,
    });
    expect(available).toHaveLength(1);
    expect(unavailable).toHaveLength(1);
    expect(unavailable[0].isSelected).toBe(false);
    expect(unavailable[0].availableQuantity).toBe(0);
  });

  it('flags exceeds_stock when request is above available', () => {
    const verdict = evaluateCartQuantityChange(4, 3);
    expect(verdict).toEqual({
      ok: false,
      reason: 'exceeds_stock',
      available: 3,
      requested: 4,
    });
  });
});
