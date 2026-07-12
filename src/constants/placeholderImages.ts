export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';

const CATEGORY_IMAGES: Record<string, string> = {
  cement:
    'https://images.unsplash.com/photo-1773394089934-3e29f2a3d6a9?auto=format&fit=crop&w=600&q=80',
  blocks:
    'https://images.unsplash.com/photo-1777793919219-5b1fd98af8cb?auto=format&fit=crop&w=600&q=80',
  gravel:
    'https://images.unsplash.com/photo-1681880511033-b9582a379ce2?auto=format&fit=crop&w=600&q=80',
  steel:
    'https://images.unsplash.com/photo-1580810734898-5e1753f23337?auto=format&fit=crop&w=600&q=80',
  roofing:
    'https://images.unsplash.com/photo-1770149682967-5733992e49ff?auto=format&fit=crop&w=600&q=80',
  tiles:
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  paint:
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
  plumbing:
    'https://images.unsplash.com/photo-1744960151551-89325664e916?auto=format&fit=crop&w=600&q=80',
  electrical:
    'https://images.unsplash.com/photo-1770838773181-e1b17ec22fee?auto=format&fit=crop&w=600&q=80',
};

export const DEFAULT_SUPPLIER_LOGO =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80';

export function resolveProductImageUri(imageUrl?: string | null, category?: string | null): string {
  if (imageUrl?.trim()) {
    return imageUrl;
  }
  if (category && CATEGORY_IMAGES[category.toLowerCase()]) {
    return CATEGORY_IMAGES[category.toLowerCase()];
  }
  return DEFAULT_PRODUCT_IMAGE;
}

export function resolveSupplierLogoUri(logoUrl?: string | null): string {
  return logoUrl?.trim() ? logoUrl : DEFAULT_SUPPLIER_LOGO;
}
