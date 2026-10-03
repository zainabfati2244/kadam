import { FilterState, INITIAL_FILTER_STATE, Product } from '../types/filter';

/**
 * Filter and sort products array according to selected FilterState.
 */
export function filterAndSortProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  // 1. Gender Filter
  if (filters.gender !== 'All') {
    result = result.filter(
      (item) => item.gender === filters.gender || item.gender === 'Unisex'
    );
  }

  // 2. Category Filter (multi-select OR match)
  if (filters.categories.length > 0) {
    result = result.filter((item) => filters.categories.includes(item.category));
  }

  // 3. Brand Filter (multi-select OR match)
  if (filters.brands.length > 0) {
    result = result.filter((item) => filters.brands.includes(item.brand));
  }

  // 4. Size Filter (multi-select: product must support at least one selected size)
  if (filters.sizes.length > 0) {
    result = result.filter((item) =>
      item.sizes.some((size) => filters.sizes.includes(size))
    );
  }

  // 5. Color Filter (multi-select: product must have at least one selected color hex)
  if (filters.colors.length > 0) {
    result = result.filter((item) =>
      item.colors.some((colorHex) =>
        filters.colors.some(
          (selectedHex) => selectedHex.toLowerCase() === colorHex.toLowerCase()
        )
      )
    );
  }

  // 6. Price Range Filter
  const [minPrice, maxPrice] = filters.priceRange;
  result = result.filter(
    (item) => item.price >= minPrice && item.price <= maxPrice
  );

  // 7. Sort By
  switch (filters.sortBy) {
    case 'newest':
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      result.sort((a, b) => b.popularity - a.popularity);
      break;
  }

  return result;
}

/**
 * Returns number of active filters applied (excluding defaults).
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.gender !== 'All') count++;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.brands.length > 0) count += filters.brands.length;
  if (filters.sizes.length > 0) count += filters.sizes.length;
  if (filters.colors.length > 0) count += filters.colors.length;
  if (
    filters.priceRange[0] > INITIAL_FILTER_STATE.priceRange[0] ||
    filters.priceRange[1] < INITIAL_FILTER_STATE.priceRange[1]
  ) {
    count++;
  }
  if (filters.sortBy !== INITIAL_FILTER_STATE.sortBy) count++;
  return count;
}

/**
 * Checks if current filter state equals default initial state.
 */
export function isDefaultFilterState(filters: FilterState): boolean {
  return countActiveFilters(filters) === 0;
}
