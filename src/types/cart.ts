import type { Product } from '@appTypes/marketplace';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  priceLabel: string;
  imageUri: string;
  imageAlt: string;
  supplierName?: string;
  unit?: string;
  quantity: number;
}

export interface CheckoutFormData {
  email: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  region: string;
}

export function productToCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    priceLabel: product.priceLabel,
    imageUri: product.imageUri,
    imageAlt: product.imageAlt,
    supplierName: product.supplierName ?? product.supplier_name,
    unit: product.unit,
    quantity,
  };
}
