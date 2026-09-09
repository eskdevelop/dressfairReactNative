import { Image } from 'react-native';

import type { CountryCode } from '@shared/config/env';

import { cdnAssetUrl, isSupportedRemoteImage } from './categoryImage';
import { displayPriceFor } from './categoryModel';
import type { HubProductRow, ListingProductRow } from './categoryModel';
import { prefetchProductDetail } from './productDetailCache';
import { prewarmPdp } from '@features/webview/pdpWebPrewarm';
import type { StorefrontProductSeed } from '@navigation/types';

function formatSeedPrice(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return (Math.round(amount * 100) / 100).toFixed(2);
}

export function seedFromListingRow(
  row: ListingProductRow | HubProductRow,
  storeCurrencyFallback: string,
): StorefrontProductSeed {
  const currency = (storeCurrencyFallback || row.currencyCode || '').trim();
  const displayAmt = formatSeedPrice(displayPriceFor(row.price));
  const priceText = currency.length > 0 ? `${currency} ${displayAmt}` : displayAmt;
  const firstImage = row.images[0]?.image ?? '';
  return {
    name: row.name,
    image: firstImage || undefined,
    priceText,
  };
}

export function prefetchListingProduct(
  row: ListingProductRow | HubProductRow,
  country: CountryCode,
): void {
  const sku = row.productSku.trim();
  if (!sku) return;
  void prefetchProductDetail(sku);

  const first = row.images[0]?.image ?? '';
  if (first) {
    const uri = cdnAssetUrl(country, first);
    if (uri && isSupportedRemoteImage(uri)) {
      void Image.prefetch(uri).catch(() => undefined);
    }
  }
}

/**
 * Strong intent (press-in / tap): warm the actual product WebView in the
 * background so the PDP opens near-instantly from cache.
 */
export function prewarmListingProduct(
  row: ListingProductRow | HubProductRow,
  country: CountryCode,
): void {
  const sku = row.productSku.trim();
  if (!sku) return;
  prefetchListingProduct(row, country);
  prewarmPdp(sku, country);
}
