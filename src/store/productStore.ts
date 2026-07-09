import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AgencyProductInput } from '@appTypes/agency';
import type { Product } from '@appTypes/marketplace';
import { MOCK_PRODUCTS } from '@constants/mockProducts';
import { formatGhCedisPrice } from '@utils/paystackAmount';
import { enrichProduct } from '@utils/productEnrichment';

interface ProductCustomizationState {
  extraProducts: Product[];
  removedProductIds: string[];
  productOverrides: Record<string, Partial<Product>>;
}

interface ProductStoreState extends ProductCustomizationState {
  hasInitialized: boolean;
}

interface ProductStoreActions {
  initialize: () => void;
  getAllProducts: () => Product[];
  getProductsByAgencyId: (agencyId: string) => Product[];
  addAgencyProduct: (agencyId: string, input: AgencyProductInput) => Product;
  updateAgencyProduct: (productId: string, agencyId: string, input: AgencyProductInput) => void;
  deleteAgencyProduct: (productId: string, agencyId: string) => void;
}

type ProductStore = ProductStoreState & ProductStoreActions;

const BASE_PRODUCTS: Product[] = MOCK_PRODUCTS.map(enrichProduct);

function buildProductFromInput(agencyId: string, input: AgencyProductInput, id?: string): Product {
  const unit = input.unit.startsWith('per ') ? input.unit : `per ${input.unit}`;
  const inStock = input.stockQuantity > 0;

  return enrichProduct({
    id: id ?? `agency-product-${Date.now()}`,
    category: input.category,
    name: input.name,
    price: input.price,
    priceLabel: formatGhCedisPrice(input.price),
    imageUri: input.imageUri,
    imageAlt: input.name,
    imageUrl: input.imageUri,
    image_url: input.imageUri,
    unit,
    description: input.description,
    agencyId,
    stockQuantity: input.stockQuantity,
    inStock,
    in_stock: inStock,
  });
}

function mergeProducts(state: ProductCustomizationState): Product[] {
  const base = BASE_PRODUCTS.filter((product) => !state.removedProductIds.includes(product.id)).map(
    (product) => ({
      ...product,
      ...state.productOverrides[product.id],
    }),
  );

  return [...base, ...state.extraProducts];
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      extraProducts: [],
      removedProductIds: [],
      productOverrides: {},
      hasInitialized: false,

      initialize: () => {
        if (get().hasInitialized) {
          return;
        }
        set({ hasInitialized: true });
      },

      getAllProducts: () => mergeProducts(get()),

      getProductsByAgencyId: (agencyId) =>
        get()
          .getAllProducts()
          .filter((product) => product.agencyId === agencyId),

      addAgencyProduct: (agencyId, input) => {
        const product = buildProductFromInput(agencyId, input);
        set((state) => ({
          extraProducts: [...state.extraProducts, product],
        }));
        return product;
      },

      updateAgencyProduct: (productId, agencyId, input) => {
        const state = get();
        const isExtra = state.extraProducts.some((product) => product.id === productId);

        if (isExtra) {
          set({
            extraProducts: state.extraProducts.map((product) =>
              product.id === productId && product.agencyId === agencyId
                ? buildProductFromInput(agencyId, input, productId)
                : product,
            ),
          });
          return;
        }

        const existing = state.getAllProducts().find((product) => product.id === productId);
        if (!existing || existing.agencyId !== agencyId) {
          return;
        }

        set({
          productOverrides: {
            ...state.productOverrides,
            [productId]: buildProductFromInput(agencyId, input, productId),
          },
        });
      },

      deleteAgencyProduct: (productId, agencyId) => {
        const state = get();
        const target = state.getAllProducts().find((product) => product.id === productId);
        if (!target || target.agencyId !== agencyId) {
          return;
        }

        const isExtra = state.extraProducts.some((product) => product.id === productId);
        if (isExtra) {
          set({
            extraProducts: state.extraProducts.filter((product) => product.id !== productId),
          });
          return;
        }

        set({
          removedProductIds: [...state.removedProductIds, productId],
          productOverrides: Object.fromEntries(
            Object.entries(state.productOverrides).filter(([id]) => id !== productId),
          ),
        });
      },
    }),
    {
      name: 'civicbuild-product-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        extraProducts: state.extraProducts,
        removedProductIds: state.removedProductIds,
        productOverrides: state.productOverrides,
        hasInitialized: state.hasInitialized,
      }),
    },
  ),
);

/** Non-hook accessor for helpers outside React components. */
export function getMarketplaceProducts(): Product[] {
  useProductStore.getState().initialize();
  return useProductStore.getState().getAllProducts();
}

/** Live marketplace catalog — merges seed data with agency CRUD from productStore. */
export function getPopularProducts(): Product[] {
  return getMarketplaceProducts();
}
