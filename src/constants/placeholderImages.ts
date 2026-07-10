export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';

export const DEFAULT_SUPPLIER_LOGO =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80';

export function resolveProductImageUri(imageUrl?: string | null): string {
  return imageUrl?.trim() ? imageUrl : DEFAULT_PRODUCT_IMAGE;
}

export function resolveSupplierLogoUri(logoUrl?: string | null): string {
  return logoUrl?.trim() ? logoUrl : DEFAULT_SUPPLIER_LOGO;
}
