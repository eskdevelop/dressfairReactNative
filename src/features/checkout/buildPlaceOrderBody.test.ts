import { buildPlaceOrderBody, getDefaultAddress } from './buildPlaceOrderBody';
import type { CustomerProfile } from '@features/account/types';
import { parseWebCartItems } from '@features/cart/parseWebCartItems';

const profile: CustomerProfile = {
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
  mobile: '+971500000000',
  email: 'john@example.com',
  image: '',
  addresses: [
    {
      id: 10,
      customerId: 1,
      address: '123 Street',
      cityId: 5,
      cityAreaId: 9,
      isDefault: 1,
      cityName: 'Dubai',
      areaName: 'Al Khabisi',
    },
  ],
};

describe('buildPlaceOrderBody', () => {
  const items = parseWebCartItems([
    {
      id: 100,
      product_option_id: 200,
      sku: 'SKU1',
      name: 'Test Product',
      quantity: 2,
      price: 39.5,
      size: 'M',
      color: 'Blue',
    },
  ]);

  it('maps default address and selected products', () => {
    const address = getDefaultAddress(profile)!;
    const body = buildPlaceOrderBody({
      profile,
      address,
      items,
      paymentMethod: { id: 1, name: 'Cash on Delivery' },
      shippingConfig: { shippingAmount: 15, freeShippingLimit: 200 },
    });

    expect(body.customer_name).toBe('John Doe');
    expect(body.customer_city_name).toBe('Dubai');
    expect(body.customer_area_name).toBe('Al Khabisi');
    expect(body.products).toHaveLength(1);
    expect(body.products[0]).toMatchObject({
      product_id: 100,
      product_option_id: 200,
      product_sku: 'SKU1',
      product_quantity: 2,
      product_price: 39.5,
    });
    expect(body.payment_method_id).toBe(1);
    expect(body.source).toBe('theme5');
  });

  it('computes shipping and total like Flutter', () => {
    const address = getDefaultAddress(profile)!;
    const body = buildPlaceOrderBody({
      profile,
      address,
      items,
      paymentMethod: { id: 1, name: 'Cash on Delivery' },
      shippingConfig: { shippingAmount: 15, freeShippingLimit: 200 },
    });
    expect(body.shipping_charges).toBe(15);
    expect(body.total_price).toBe(39.5 * 2 + 15);
  });
});
