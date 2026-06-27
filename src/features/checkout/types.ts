import type { CartLineItem } from '@features/cart/cartTypes';

export type CheckoutPaymentMethod = {
  id: number;
  name: string;
  className?: string;
  logo?: string;
};

export type PlaceOrderProduct = {
  product_id: number;
  product_option_id: number;
  product_option_label: string;
  product_option_color: string;
  product_name: string;
  product_quantity: number;
  product_sku: string;
  product_price: number;
};

export type PlaceOrderBody = {
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_city_id: number | string;
  customer_area_id: number | string;
  customer_city_name: string;
  customer_area_name: string;
  customer_address: string;
  products: PlaceOrderProduct[];
  shipping_charges: number;
  source: 'theme5';
  total_price: number;
  payment_method_id: number;
  payment_method: string;
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      /**
       * Present for card / online payment methods: the hosted payment page
       * (e.g. Stripe Checkout) the user must complete before the order is paid.
       * Absent for Cash on Delivery, where the order is final immediately.
       */
      checkoutUrl?: string;
      sessionId?: string;
    }
  | { ok: false; message: string };

export type OrderSuccessProduct = {
  quantity: number;
  name: string;
  sku: string;
};

export type OrderSuccessDetail = {
  customerName: string;
  customerMobile: string;
  customerCountry: string;
  customerCity: string;
  customerArea: string;
  orderTotalAmount: string;
  currencyCode: string;
  products: OrderSuccessProduct[];
};

export type CheckoutSelectedContext = {
  items: CartLineItem[];
  currency: string;
};
