import type { Order, OrderProductImage } from './types';

/** Flatten and de-duplicate product images across all line items in an order. */
export function collectOrderImages(order: Order): OrderProductImage[] {
  const seen = new Set<string>();
  const images: OrderProductImage[] = [];
  for (const product of order.products) {
    for (const image of product.images) {
      if (seen.has(image.url)) continue;
      seen.add(image.url);
      images.push(image);
    }
  }
  return images;
}
