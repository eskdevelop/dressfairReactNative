import type { CategoryRow } from './categoryModel';

export function isFeatureHubCategory(cat: CategoryRow): boolean {
  return cat.id === 0 && cat.name === 'All';
}

/**
 * Storefront `/c/{slug}` for "View All" / popular-row parity with Category hub.
 */
export function listingSlugForViewAll(cat: CategoryRow): string | null {
  if (!cat.subCategories.length) return null;
  if (isFeatureHubCategory(cat)) {
    return cat.subCategories[0]?.slug?.trim() || null;
  }
  const c = cat.slug?.trim();
  if (c) return c;
  const withSlug = cat.subCategories.find(ss => (ss.slug ?? '').trim().length > 0);
  return withSlug?.slug?.trim() ?? null;
}

/**
 * Native `CategoryListing` key when no web slug (Flutter name-based parity).
 */
export function cateKeyForCategoryListing(cat: CategoryRow | null): string | null {
  if (!cat?.subCategories.length) return null;
  const subs = cat.subCategories;
  if (subs.length === 1) return subs[0].name;
  return subs[1].name;
}

/** View All on category hub — first subcategory slug (dressfair.com parity). */
export function firstSubcategoryListingSlug(cat: CategoryRow | null): string | null {
  if (!cat?.subCategories.length) return null;
  const first = cat.subCategories[0];
  const slug = first?.slug?.trim();
  if (slug) return slug;
  return first?.name?.trim() || null;
}

/** Resolve listing slug for a subcategory row. */
export function subcategoryListingSlug(sub: { slug?: string | null; name: string }): string {
  const s = sub.slug?.trim();
  return s || sub.name;
}
