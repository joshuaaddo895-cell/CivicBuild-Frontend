import type { MarketplaceCategory, Product, Supplier } from '@appTypes/marketplace';

import { MOCK_PRODUCTS } from './mockProducts';

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

export const TRUSTED_SUPPLIERS: Supplier[] = [
  {
    id: 'west-africa-cement',
    name: 'West Africa Cement',
    logoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU6z37ivgb9E8BnrC7zMlkwk_Sa3sYQanhVtqGz4DlVXcp-fp42BFblf2MDj-Yf_IKRKMwGIQ27MgrPGN7o43_WR1ya6CYD5NGhpNb7GtQkHUyhe5TfzBtRoo1PbweNnGwH5ZK9K5QwKFp0Elc9x2nUi1W7nDrooqcIcE5fsg_NMPU-8qjLi94eLwyMhOMZSSbKRFhCH8YtpUwgcNt40-kMsoJ0NPw0v33fhDoXqgDKUMWv2jGth9W',
    rating: 4.9,
    reviewCount: 120,
    distanceKm: 2.4,
    verified: true,
  },
  {
    id: 'buildstrong-ltd',
    name: 'BuildStrong Ltd',
    logoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1lV8yWOSrjZWyPs5UsgUw2BLnMm0JvBP3wrrt50t4V5SIw9JMRRjDLIuCDUCB2z1-xGfotX6gygCZKpspKM4dHK5ZKFZ3S8Y8evF8wfb2_T9Z_QfvwACgk-KcNH8-sNo9vjCHeqRK9FjhCixhxYeF30aWg2UKczBkYNigxLYGOOw8dVqdZuOm8pg4K1Jnx0wmu4rBbTCnjRQU_cQ8yFTruLhn11JM1eegRBqiGG5aVi_BlcSRMjmj',
    rating: 4.7,
    reviewCount: 85,
    distanceKm: 5.1,
    verified: true,
  },
];

export const POPULAR_PRODUCTS: Product[] = MOCK_PRODUCTS;

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
