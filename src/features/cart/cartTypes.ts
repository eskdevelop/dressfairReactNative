/** One row from dressfair.com `localStorage` key `cart`. */
export type WebCartRawItem = {
  id?: number | string;
  product_id?: number | string;
  productId?: number | string;
  product_option_id?: number | string;
  productOptionId?: number | string;
  option_id?: number | string;
  optionId?: number | string;
  sku?: string;
  model?: string;
  name?: string;
  product_name?: string;
  product_sku?: string;
  productSku?: string;
  productName?: string;
  variant_id?: number | string;
  variantId?: number | string;
  unit_price?: number | string;
  unitPrice?: number | string;
  special_price?: number | string;
  specialPrice?: number | string;
  compare_at_price?: number | string;
  compareAtPrice?: number | string;
  thumbnail?: string;
  optionLabel?: string;
  optionColor?: string;
  quantity?: number | string;
  qty?: number | string;
  price?: number | string;
  normal_price?: number | string;
  normalPrice?: number | string;
  discount_percent?: number | string;
  discountPercent?: number | string;
  image?: string;
  thumb?: string;
  size?: string;
  color?: string;
  option_label?: string;
  option_color?: string;
  available_quantity?: number | string;
  availableQuantity?: number | string;
  available_qty?: number | string;
  availableQty?: number | string;
  [key: string]: unknown;
};

export type CartLineItem = {
  /** Stable merge key: sku + product option id. */
  lineKey: string;
  productId: number;
  productOptionId: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  /** Strikethrough compare-at price when discounted. */
  normalPrice?: number;
  discountPercent?: number;
  /** Checkout / manage-cart selection (not persisted to web cart). */
  isSelected: boolean;
  image?: string;
  size?: string;
  color?: string;
  /** Last known in-stock cap for this variant (from API or web cart row). */
  availableQuantity?: number | null;
  /** Original web payload for checkout write-back. */
  web: WebCartRawItem;
};

export type CartSnapshotMessage = {
  type: 'cart_snapshot';
  items: WebCartRawItem[];
  source?: string;
};
