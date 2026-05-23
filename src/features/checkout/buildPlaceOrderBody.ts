import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import type { CartShippingConfig } from '@features/cart/cartPricing';
import {
  checkShipping,
  selectedCartLines,
  selectedTotalPrice,
} from '@features/cart/cartPricing';
import type { CartLineItem } from '@features/cart/cartTypes';

import type { CheckoutPaymentMethod, PlaceOrderBody } from './types';

export function getDefaultAddress(
  profile: CustomerProfile,
): CustomerAddressRecord | null {
  const def = profile.addresses.find(a => a.isDefault === 1);
  if (def) return def;
  return profile.addresses[0] ?? null;
}

export function isProfileCompleteForCheckout(profile: CustomerProfile): boolean {
  return (
    profile.firstname.trim().length > 0 &&
    profile.lastname.trim().length > 0 &&
    profile.email.trim().length > 0 &&
    profile.mobile.trim().length > 0
  );
}

export function buildPlaceOrderBody(params: {
  profile: CustomerProfile;
  address: CustomerAddressRecord;
  items: CartLineItem[];
  paymentMethod: CheckoutPaymentMethod;
  shippingConfig: CartShippingConfig;
}): PlaceOrderBody {
  const { profile, address, items, paymentMethod, shippingConfig } = params;
  const selected = selectedCartLines(items);
  const subtotal = selectedTotalPrice(items);
  const shippingCharges = checkShipping(subtotal, shippingConfig);
  const totalPrice = subtotal + shippingCharges;

  const products = selected.map(item => ({
    product_id: item.productId,
    product_option_id: item.productOptionId,
    product_option_label: item.size ?? '',
    product_option_color: item.color ?? '',
    product_name: item.name,
    product_quantity: item.quantity,
    product_sku: item.sku,
    product_price: item.price,
  }));

  return {
    customer_name: `${profile.firstname} ${profile.lastname}`.trim(),
    customer_email: profile.email,
    customer_mobile: profile.mobile,
    customer_city_id: address.cityId,
    customer_area_id: address.cityAreaId,
    customer_city_name: address.cityName ?? '',
    customer_area_name: address.areaName ?? '',
    customer_address: address.address,
    products,
    shipping_charges: shippingCharges,
    source: 'theme5',
    total_price: totalPrice,
    payment_method_id: paymentMethod.id,
    payment_method: paymentMethod.name,
  };
}
