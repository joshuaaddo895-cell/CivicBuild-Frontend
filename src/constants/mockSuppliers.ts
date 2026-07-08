import type { Supplier } from '@appTypes/marketplace';

const IMAGES = {
  cement:
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80',
  blocks:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
  gravel:
    'https://images.unsplash.com/photo-1618220147828-4f7c3d7f7b93?auto=format&fit=crop&w=200&q=80',
  steel:
    'https://images.unsplash.com/photo-1565195164432-7b915e3fac8b?auto=format&fit=crop&w=200&q=80',
  roofing:
    'https://images.unsplash.com/photo-1632778149955-9c7f7370e4e8?auto=format&fit=crop&w=200&q=80',
  tiles:
    'https://images.unsplash.com/photo-1615873968403-89e068baa2be?auto=format&fit=crop&w=200&q=80',
  paint:
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80',
  plumbing:
    'https://images.unsplash.com/photo-1585704032915-c3400ca276ec?auto=format&fit=crop&w=200&q=80',
  electrical:
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=200&q=80',
  warehouse:
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=200&q=80',
};

export const ALL_SUPPLIERS: Supplier[] = [
  {
    id: 'west-africa-cement',
    name: 'West Africa Cement',
    logoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU6z37ivgb9E8BnrC7zMlkwk_Sa3sYQanhVtqGz4DlVXcp-fp42BFblf2MDj-Yf_IKRKMwGIQ27MgrPGN7o43_WR1ya6CYD5NGhpNb7GtQkHUyhe5TfzBtRoo1PbweNnGwH5ZK9K5QwKFp0Elc9x2nUi1W7nDrooqcIcE5fsg_NMPU-8qjLi94eLwyMhOMZSSbKRFhCH8YtpUwgcNt40-kMsoJ0NPw0v33fhDoXqgDKUMWv2jGth9W',
    rating: 4.9,
    reviewCount: 120,
    distanceKm: 2.4,
    verified: true,
    categoryId: 'cement',
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
    categoryId: 'cement',
  },
  {
    id: 'accra-cement-depot',
    name: 'Accra Cement Depot',
    logoUri: IMAGES.cement,
    rating: 4.6,
    reviewCount: 94,
    distanceKm: 0.8,
    verified: true,
    categoryId: 'cement',
  },
  {
    id: 'tema-blocks-yard',
    name: 'Tema Blocks & Masonry Yard',
    logoUri: IMAGES.blocks,
    rating: 4.5,
    reviewCount: 67,
    distanceKm: 3.2,
    verified: true,
    categoryId: 'blocks',
  },
  {
    id: 'ashanti-blockworks',
    name: 'Ashanti Blockworks Co.',
    logoUri: IMAGES.blocks,
    rating: 4.3,
    reviewCount: 41,
    distanceKm: 8.6,
    verified: false,
    categoryId: 'blocks',
  },
  {
    id: 'quarry-direct-gh',
    name: 'Quarry Direct Ghana',
    logoUri: IMAGES.gravel,
    rating: 4.8,
    reviewCount: 112,
    distanceKm: 6.4,
    verified: true,
    categoryId: 'gravel',
  },
  {
    id: 'accra-aggregates',
    name: 'Accra Aggregates & Sand',
    logoUri: IMAGES.gravel,
    rating: 4.4,
    reviewCount: 58,
    distanceKm: 4.7,
    verified: true,
    categoryId: 'gravel',
  },
  {
    id: 'tema-steel-merchants',
    name: 'Tema Steel Merchants',
    logoUri: IMAGES.steel,
    rating: 4.7,
    reviewCount: 73,
    distanceKm: 7.3,
    verified: true,
    categoryId: 'steel',
  },
  {
    id: 'ironman-rebar',
    name: 'IronMan Rebar Supplies',
    logoUri: IMAGES.steel,
    rating: 4.2,
    reviewCount: 29,
    distanceKm: 11.5,
    verified: false,
    categoryId: 'steel',
  },
  {
    id: 'kumasi-roofing-hub',
    name: 'Kumasi Roofing Hub',
    logoUri: IMAGES.roofing,
    rating: 4.6,
    reviewCount: 51,
    distanceKm: 9.1,
    verified: true,
    categoryId: 'roofing',
  },
  {
    id: 'aluzinc-ghana',
    name: 'AluZinc Ghana Roofing',
    logoUri: IMAGES.roofing,
    rating: 4.5,
    reviewCount: 38,
    distanceKm: 5.9,
    verified: true,
    categoryId: 'roofing',
  },
  {
    id: 'tilecraft-accra',
    name: 'TileCraft Accra',
    logoUri: IMAGES.tiles,
    rating: 4.4,
    reviewCount: 44,
    distanceKm: 2.9,
    verified: true,
    categoryId: 'tiles',
  },
  {
    id: 'finishing-touch-paints',
    name: 'Finishing Touch Paints',
    logoUri: IMAGES.paint,
    rating: 4.3,
    reviewCount: 36,
    distanceKm: 3.8,
    verified: true,
    categoryId: 'paint',
  },
  {
    id: 'flowmaster-plumbing',
    name: 'FlowMaster Plumbing Depot',
    logoUri: IMAGES.plumbing,
    rating: 4.5,
    reviewCount: 47,
    distanceKm: 4.2,
    verified: true,
    categoryId: 'plumbing',
  },
  {
    id: 'voltline-electrical',
    name: 'VoltLine Electrical Wholesale',
    logoUri: IMAGES.electrical,
    rating: 4.1,
    reviewCount: 22,
    distanceKm: 12.0,
    verified: false,
    categoryId: 'electrical',
  },
];

export const DASHBOARD_SUPPLIER_LIMIT = 6;

export function filterSuppliersByCategory(suppliers: Supplier[], categoryId: string): Supplier[] {
  if (categoryId === 'all') {
    return suppliers;
  }

  return suppliers.filter((supplier) => supplier.categoryId === categoryId);
}
