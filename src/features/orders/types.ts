// Customer summary block returned alongside the orders list. We keep this
// optional everywhere so the screen can degrade gracefully if the API
// shape changes.
export type OrderCustomer = {
  customerName?: string;
  customerMobile?: string;
  customerCountry?: string;
  customerCity?: string;
  customerArea?: string;
};

export type OrderProductImage = {
  id?: number;
  // Always a fully-qualified https:// URL. Relative paths from the API are
  // resolved against the country-aware image host before they reach the
  // screen, so callers can use these directly with `<Image source>`.
  url: string;
};

export type OrderProduct = {
  productSku: string;
  productName: string;
  quantity: number;
  // Optional size / variant label the user picked at checkout.
  optionLabel?: string;
  images: OrderProductImage[];
};

export type Order = {
  orderId: number;
  // Pre-formatted total amount as the API returns it (e.g. "94.00"). The
  // screen joins this with the currency code at render time so we never
  // re-format numbers on the client.
  orderTotalAmount: string;
  currencyCode: string;
  // Free-text status from the backend: "Pending", "Processing", "Shipped",
  // "Delivered", "Cancelled", "Complete", etc. The screen normalises this
  // for the status pill colour.
  orderStatus: string;
  products: OrderProduct[];
};

export type OrderHistoryResponse = {
  success: boolean;
  message?: string;
  customer?: OrderCustomer;
  orders: Order[];
};

// Status filter values surfaced to the user. We filter client-side because
// the API returns the full list per logged-in customer; if the backend
// ever adds a server-side filter we can route this through to the request.
export type OrderStatusFilter = 'all' | 'pending' | 'completed';
