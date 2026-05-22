/** Checkout WebView URL derived from regional cart URL. */
export function checkoutWebUrl(cartWebUrl: string): string {
  return cartWebUrl.replace(/\/cart\/?(\?.*)?$/i, '/checkout$1');
}

/** Product image from web cart row — absolute URL or CDN-relative path. */
export function cartLineImageUri(
  image: string | undefined,
  cdnBase: string,
): string | undefined {
  if (!image?.trim()) return undefined;
  const t = image.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const base = cdnBase.replace(/\/+$/, '');
  return `${base}/${t.replace(/^\/+/, '')}`;
}
