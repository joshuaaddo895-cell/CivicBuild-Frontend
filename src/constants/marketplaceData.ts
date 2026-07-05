import type { MarketplaceCategory, Product, Supplier } from '@appTypes/marketplace';

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

export const POPULAR_PRODUCTS: Product[] = [
  {
    id: 'concrete-blocks',
    category: 'Blocks',
    name: 'Concrete Blocks (5-inch)',
    price: 5.5,
    priceLabel: '₵5.50',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIq99UI1Msy6aL_cCUvyigpFH3S8u1xTmPlQxXZLHwjtUEoWXexcswvr1Mrz4TuPo8xtAJ8zllkZYd1fDA8nj0YCOr3qkJ2sjg_0gbVQAXmxH6JSHkcTYfKTkASz7Bzuc6qL17vZZtSc7S--kHQe6CtT0RB5vVz-fRnvjBpnpmLqs3JdWf_uVOaA6qfbXC2-bFsi2ivJo-Gk24GBMO4E0s9gktnx7yEufAyxiTjjF9leeIBWF8zLC',
    imageAlt: 'Stacked grey concrete blocks on a construction site',
  },
  {
    id: 'river-sand',
    category: 'Aggregates',
    name: 'Sharp River Sand (m³)',
    price: 320,
    priceLabel: '₵320.00',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfM2EzwOqbIIC7L9gfv0pEEqybpoHkyvJJrOAW3xAEvdt8-MQSR9BbZfytO0ZRfIzgGoKQKIfCaU2GqLe7fSvA-2myqqAbINNE6s5_CoXdZ0zhVaid3Hx_1pE8wdP47ipFX8iXmiGfqKtYm6Kj7KMYx_v-87MQYg_OgJ5k2jc27hSpyAQBJuoXjiNzbE-tYvDbrq12furXtcpYyQWKN912XyYijUOf2Xh0LSQ6fFGXMQb80NCz80Pa',
    imageAlt: 'Pile of construction river sand',
  },
  {
    id: 'dangote-cement',
    category: 'Cement',
    name: 'Dangote 42.5R (50kg)',
    price: 95,
    priceLabel: '₵95.00',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCF39LLExg5mDMG45ee7NUpNSU-x_-Tlpuwd5fkUcgDGTj1FKzsWwaJs04Ymh3swzRYe5LB9SqAAgCs8R9wmnTj3IJmUIaxMmhItBcxjoJ3xRpP_feUMmvGEnUuVBL9_M-k6IUISuDoo7wn21UtaXag5D-LhvptKJaAiK1R5fmSAz5aadWrppV4uft9859nqaDENeBmtnWHQrOcZtpHOrT3h6O9ZHHRgpFJGUsSZkxvSUwOmzuPWXt',
    imageAlt: 'Stacked cement bags in a warehouse',
  },
  {
    id: 'ceramic-tiles',
    category: 'Finishing',
    name: 'Ceramic Tiles (60x60)',
    price: 180,
    priceLabel: '₵180.00',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT5yWasOxp-QdFuwPB2kF3Alf-vWyACZXcy3R0rPkewUjUzU6qEd3Oxd33Fgomk7Ztu7g09AaxWcinvXdj4uXZBXYTxpcDIWqwQcqufNfzxQVjyz-m4sAsxHM5Sv9kO2DhH7v3xanLRk0obGcfQOsuS2K8OIvpzEVSLECaZbUzEDpVKPPOzeDnkUQMijNUcf-7_KQYG-o0ZLqtSFIwJKGiV7OjAEr-85_pNsBsUMVoNobvdgtm6p24',
    imageAlt: 'Ceramic floor tiles with marble pattern',
  },
  {
    id: 'pvc-pipe',
    category: 'Plumbing',
    name: 'PVC Pipe (4-inch)',
    price: 45,
    priceLabel: '₵45.00',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Sl8YuKZMwJFy3AnqFNOQ9a4Vd2mm7igv7vJjicZeWPawkblhqgFfvVIkDI9TuLo3NsFNxDutTc0A4on3b6l5Isvp7ZlcCAzdkf0vQ02yGwSVlZB_EFxZ4LOrJytfWWLp_82pUAdOSuy8xThv-CqBldMbOzHjlgaSygefwYpSSzeozrwTJLfR32anrN59MYxhLp8lWDez4NumepITq4w34hTfMMVY_3JCgBhYuRosW2QLM-7twQSB',
    imageAlt: 'Blue PVC plumbing pipes stacked horizontally',
  },
  {
    id: 'roofing-sheets',
    category: 'Roofing',
    name: 'Alu-Zinc Sheets (0.5mm)',
    price: 110,
    priceLabel: '₵110.00',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxWE1ntNMpPYNrKQFSD2tsZgJH3ko6_rv_TssFxrGTe2q6oPbE4kDRe34ObZZbCNBeJY4Jq-YN1koUg2v-8vipg0SEhoPDfRNy-Cx5S7enSqygmbe99UlftUzPq1T5_9EPeP2HwPBiSLqpUiPx44O_tTboT676h_4QfxH0IYh5l97GOMWRNmyFcfvizS52Muc66RwHYNu11bUQvWBqd1FkdHTIcmm7jihdxKN8jYWBEoq5yLI73-8A',
    imageAlt: 'Charcoal aluminum roofing sheets',
  },
];

export function filterProductsByCategory(products: Product[], categoryId: string): Product[] {
  if (categoryId === 'all') {
    return products;
  }

  const categoryMap: Record<string, string[]> = {
    cement: ['Cement'],
    blocks: ['Blocks'],
    gravel: ['Aggregates'],
    steel: ['Steel'],
    roofing: ['Roofing'],
    tiles: ['Finishing'],
    paint: ['Paint'],
    plumbing: ['Plumbing'],
    electrical: ['Electrical'],
  };

  const labels = categoryMap[categoryId] ?? [];
  return products.filter((product) => labels.includes(product.category));
}
