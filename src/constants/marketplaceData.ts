import type { MarketplaceCategory, Product, Supplier } from '@appTypes/marketplace';
import { enrichProduct } from '@utils/productEnrichment';

import { MOCK_PRODUCTS } from './mockProducts';
import { ALL_SUPPLIERS, DASHBOARD_SUPPLIER_LIMIT } from './mockSuppliers';

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

/** Full supplier catalog — used by enrichment, favorites, and All Suppliers. */
export const TRUSTED_SUPPLIERS: Supplier[] = ALL_SUPPLIERS;

/** Subset shown in the dashboard horizontal carousel. */
export const DASHBOARD_SUPPLIERS: Supplier[] = ALL_SUPPLIERS.slice(0, DASHBOARD_SUPPLIER_LIMIT);

export const POPULAR_PRODUCTS: Product[] = MOCK_PRODUCTS.map(enrichProduct);

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
