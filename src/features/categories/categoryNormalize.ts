import type { CategoryRow, HubProductRow } from './categoryModel';

/** Flutter `CategoryController.getCategories` insert(0, synthetic) behavior. */
export function insertSyntheticFeaturedRow(fetchedList: CategoryRow[]): CategoryRow[] {
  if (fetchedList.length === 0) return [];

  const allSubCategories = fetchedList.flatMap(cat => [...cat.subCategories]);

  /** Take first **15** products from first fetched category (`take(15)` in Dart). */
  const firstProducts: HubProductRow[] = fetchedList[0]?.products.slice(0, 15).map(cloneHubProduct) ?? [];

  const synthetic: CategoryRow = {
    id: 0,
    name: 'All',
    nameAr: 'الكل',
    image: undefined,
    slug: undefined,
    subCategories: allSubCategories.map(s => ({ ...s })),
    products: firstProducts,
  };

  return [synthetic, ...fetchedList.map(cloneCategoryRow)];
}

function cloneHubProduct(p: HubProductRow): HubProductRow {
  return {
    ...p,
    images: p.images.map(i => ({ ...i })),
    productCategory: p.productCategory ? { ...p.productCategory } : null,
    price: { ...p.price },
  };
}

function cloneCategoryRow(c: CategoryRow): CategoryRow {
  return {
    ...c,
    subCategories: c.subCategories.map(s => ({ ...s })),
    products: c.products.map(cloneHubProduct),
  };
}
