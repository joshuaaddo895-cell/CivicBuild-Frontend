import { create } from 'zustand';

import type { CartItem } from '@appTypes/cart';
import { productToCartItem } from '@appTypes/cart';
import type { Product } from '@appTypes/marketplace';

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addProduct: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addProduct: (product) => {
    const existing = get().items.find((item) => item.productId === product.id);

    if (existing) {
      set({
        items: get().items.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      });
      return;
    }

    set({ items: [...get().items, productToCartItem(product)] });
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
