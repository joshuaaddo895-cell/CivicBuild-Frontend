import type { MarketplaceCategory, Product } from '@appTypes/marketplace';

export const MARKETPLACE_LOCATION = 'Accra, Ghana';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'cement', label: 'Cement' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'gravel', label: 'Gravel' },
  { id: 'steel', label: 'Steel' },
  { id: 'roofing', label: 'Roofing' },
  { id: 'tiles', label: 'Tiles' },
  { id: 'paint', label: 'Paint' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
];

export function filterProductsByCategory(products: Product[], categoryId: string): Product[] {
  if (categoryId === 'all') {
    return products;
  }
  return products.filter((product) => product.category.toLowerCase() === categoryId.toLowerCase());
}

export function filterProductsBySearch(products: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products;
  }
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.category.toLowerCase().includes(normalized) ||
      (product.supplierName && product.supplierName.toLowerCase().includes(normalized)),
  );
}

export function filterSuppliersBySearch<T extends { name: string; categoryId: string }>(
  suppliers: T[],
  query: string,
  categoryLabelResolver?: (categoryId: string) => string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return suppliers;
  }

  return suppliers.filter((supplier) => {
    const categoryLabel = categoryLabelResolver?.(supplier.categoryId).toLowerCase() ?? '';

    return (
      supplier.name.toLowerCase().includes(normalized) ||
      supplier.categoryId.toLowerCase().includes(normalized) ||
      categoryLabel.includes(normalized)
    );
  });
}
