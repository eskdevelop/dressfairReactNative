/** Mirrors Flutter `SubCategoryController.applySort` mapping. */

export type SortChoice = 'Default' | 'New Arrival' | 'Popular' | 'Price: Low to High' | 'Price: High to Low';

export function apiSortFieldsForChoice(choice: SortChoice): { sort: string; order: string } {
  switch (choice) {
    case 'New Arrival':
      return { sort: 'new', order: 'desc' };
    case 'Popular':
      return { sort: 'popular', order: 'desc' };
    case 'Price: Low to High':
      return { sort: 'price', order: 'asc' };
    case 'Price: High to Low':
      return { sort: 'price', order: 'desc' };
    default:
      return { sort: '', order: '' };
  }
}

export function labelForStoredSort(sort: SortChoice): string {
  return sort === 'Default' ? 'Sort by: Default' : `Sort by: ${sort}`;
}
