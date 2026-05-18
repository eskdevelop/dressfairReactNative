/** Mirrors Flutter `category_model.dart` / `main_product_model.dart` for mobile JSON. */

export type ProductImage = {
  image: string;
  isMain: number;
  isArabicMain: number;
};

export type ProductCategory = {
  name: string;
  nameAr: string;
};

export type ProductPriceModel = {
  quantity?: number | null;
  normalPrice: number;
  salePrice?: number | null;
  offerPrice?: number | null;
  bundlePrice?: number | null;
  hasSale: boolean;
  hasOffer: boolean;
  hasBundle: boolean;
  hasNormal: boolean;
};

export type HubProductRow = {
  productId: number;
  productSku: string;
  currencyCode: string;
  name: string;
  nameAr: string;
  productCategory: ProductCategory | null;
  price: ProductPriceModel;
  images: ProductImage[];
};

export type SubCategoryRow = {
  id: number;
  groupMainCategoryId: number;
  name: string;
  nameAr: string;
  image?: string | null;
  slug?: string | null;
};

export type CategoryRow = {
  id: number;
  name: string;
  nameAr: string;
  image?: string | null;
  slug?: string | null;
  subCategories: SubCategoryRow[];
  products: HubProductRow[];
};

function parseNum(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickFirstKeyedNum(row: Record<string, unknown>, keys: readonly string[]): number {
  for (const k of keys) {
    if (!(k in row)) continue;
    const v = row[k];
    if (v === null || v === undefined || v === '') continue;
    return parseNum(v);
  }
  return 0;
}

function parseBoolFlag(value: unknown): boolean {
  return value === true;
}

export function parseProductPrice(json: Record<string, unknown>): ProductPriceModel {
  const hasSale = parseBoolFlag(json.has_sale ?? json.hasSale);
  const hasOffer = parseBoolFlag(json.has_offer ?? json.hasOffer);
  const hasBundle = parseBoolFlag(json.has_bundle ?? json.hasBundle);
  const hasNormal = parseBoolFlag(json.has_normal ?? json.hasNormal);

  let resolvedNormal = 0;
  if ('normal_price' in json && json.normal_price !== undefined) {
    resolvedNormal = parseNum(json.normal_price);
  } else if ('normalPrice' in json && json.normalPrice !== undefined) {
    resolvedNormal = parseNum(json.normalPrice);
  } else if (hasNormal && 'price' in json && json.price !== undefined) {
    resolvedNormal = parseNum(json.price);
  }

  /** Some mobile payloads send `price` without `has_normal` (Flutter would also show 0). */
  if (resolvedNormal === 0 && !hasBundle && !hasOffer && !hasSale) {
    const raw = json.price ?? json.normal_price ?? json.normalPrice;
    if (raw !== undefined && raw !== null && raw !== '') {
      resolvedNormal = parseNum(raw);
    }
  }

  return {
    quantity:
      typeof json.quantity === 'number'
        ? json.quantity
        : json.quantity !== undefined && json.quantity !== null
          ? Number.parseInt(String(json.quantity), 10) || null
          : null,
    normalPrice: resolvedNormal,
    salePrice: hasSale ? parseNum(json.sale_price ?? json.salePrice) : null,
    offerPrice: hasOffer ? parseNum(json.offer_price ?? json.offerPrice) : null,
    bundlePrice: hasBundle ? parseNum(json.price) : null,
    hasSale,
    hasOffer,
    hasBundle,
    hasNormal,
  };
}

/** Flutter `ProductPrice.getDisplayPrice` / `MainProductPrice.getDisplayPrice`. */
export function displayPriceFor(p: ProductPriceModel): number {
  if (p.hasOffer && p.offerPrice != null) return p.offerPrice;
  if (p.hasSale && p.salePrice != null) return p.salePrice;
  if (p.hasBundle && p.bundlePrice != null) return p.bundlePrice;
  return p.normalPrice;
}

export function strikePriceIfAny(p: ProductPriceModel): number | null {
  const d = displayPriceFor(p);
  if (d !== p.normalPrice) return p.normalPrice;
  return null;
}

/** Printable amount for hub / listing grids. */
export function formatHubPriceAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '0';
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

/**
 * Flutter: `currencyCode` on product rows is often blank; UI uses `SessionController.countryConfig.currencyCode`.
 * When Redux already has store currency (after `/store/setting`), prefer it over a mismatched API echo (e.g. AED on a `/sa` session).
 */
export function hubPriceLine(row: HubProductRow, storeCurrencyFallback?: string): string {
  const fb = (storeCurrencyFallback ?? '').trim();
  const rowCode = (row.currencyCode ?? '').trim();
  const code = fb.length > 0 ? fb : rowCode;
  const amt = formatHubPriceAmount(displayPriceFor(row.price));
  return code.length > 0 ? `${code} ${amt}` : amt;
}

/** OpenCart / mobile payloads use `product_sku` or `model` (Flutter parity — see Search API parsers). */
function pickProductSku(row: Record<string, unknown>): string {
  const v =
    row.product_sku ?? row.productSku ?? row.sku ?? row.model ?? row.product_model;
  return String(v ?? '').trim();
}

export function parseProductRow(json: unknown): HubProductRow | null {
  if (!json || typeof json !== 'object') return null;
  const row = json as Record<string, unknown>;

  let priceResolved: Record<string, unknown> = {};
  const priceJson = row.price;
  if (Array.isArray(priceJson) && priceJson.length > 0 && priceJson[0] && typeof priceJson[0] === 'object') {
    priceResolved = priceJson[0] as Record<string, unknown>;
  } else if (priceJson && typeof priceJson === 'object') {
    priceResolved = priceJson as Record<string, unknown>;
  }

  let pc: ProductCategory | null = null;
  const pci = row.product_category;
  if (pci && typeof pci === 'object') {
    const o = pci as Record<string, unknown>;
    pc = {
      name: String(o.name ?? ''),
      nameAr: String(o.name_ar ?? ''),
    };
  }

  const imagesRaw = row.images;
  const images: ProductImage[] = Array.isArray(imagesRaw)
    ? imagesRaw.filter(i => i && typeof i === 'object').map(i => parseProductImage(i as Record<string, unknown>))
    : [];

  const productIdRaw = row.product_id;
  const productId =
    typeof productIdRaw === 'number'
      ? productIdRaw
      : Number.parseInt(String(productIdRaw ?? 0), 10) || 0;

  return {
    productId,
    productSku: pickProductSku(row),
    currencyCode: String(row.currency_code ?? row.currencyCode ?? ''),
    name: String(row.name ?? ''),
    nameAr: String(row.name_ar ?? ''),
    productCategory: pc,
    price: parseProductPrice(priceResolved),
    images,
  };
}

function parseProductImage(json: Record<string, unknown>): ProductImage {
  const parseFlag = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number.parseInt(v, 10) || 0;
    return 0;
  };
  return {
    image: String(json.image ?? ''),
    isMain: parseFlag(json.isMain ?? json.is_main),
    isArabicMain: parseFlag(json.isArabicMain ?? json.is_arabic_main),
  };
}

export function parseSubCategoryRow(json: unknown): SubCategoryRow | null {
  if (!json || typeof json !== 'object') return null;
  const row = json as Record<string, unknown>;

  const id = pickFirstKeyedNum(row, [
    'id',
    'sub_category_id',
    'category_id',
    'subCategoryId',
    'categoryId',
  ]);
  const groupMainCategoryId = pickFirstKeyedNum(row, [
    'group_main_category_id',
    'groupMainCategoryId',
    'main_category_id',
    'mainCategoryId',
    'parent_id',
    'parentId',
  ]);

  return {
    id,
    groupMainCategoryId,
    name: String(row.name ?? row.title ?? ''),
    nameAr: String(row.name_ar ?? row.nameAr ?? ''),
    image: row.image !== undefined ? (row.image as string | null) : undefined,
    slug: row.slug !== undefined ? (row.slug as string | null) : undefined,
  };
}

export function parseCategoryRow(json: unknown): CategoryRow | null {
  if (!json || typeof json !== 'object') return null;
  const row = json as Record<string, unknown>;
  const idRaw = row.id;
  const id = typeof idRaw === 'number' ? idRaw : Number.parseInt(String(idRaw ?? 0), 10) || 0;

  const subsRaw =
    Array.isArray(row.sub_categories) ? row.sub_categories : Array.isArray(row.subCategories) ? row.subCategories : [];
  const subCategories: SubCategoryRow[] = subsRaw.map(parseSubCategoryRow).filter(Boolean) as SubCategoryRow[];

  const productsRaw = row.products;
  const products: HubProductRow[] = Array.isArray(productsRaw)
    ? productsRaw.map(parseProductRow).filter(Boolean) as HubProductRow[]
    : [];

  return {
    id,
    name: String(row.name ?? ''),
    nameAr: String(row.name_ar ?? ''),
    image: row.image !== undefined ? (row.image as string | null) : undefined,
    slug: row.slug !== undefined ? (row.slug as string | null) : undefined,
    subCategories,
    products,
  };
}

export type ListingProductRow = HubProductRow;

/** Parses `MainProductModel` array from storefront products listing API `data`. */
export function parseListingProductRow(json: unknown): ListingProductRow | null {
  return parseProductRow(json);
}
