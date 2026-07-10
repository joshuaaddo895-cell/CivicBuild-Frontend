import { create } from 'zustand';

import { getProducts } from '@api/catalog';
import type { AgencyProductInput } from '@appTypes/agency';
import type { Product } from '@appTypes/marketplace';
import { formatGhCedisPrice } from '@utils/paystackAmount';
import { enrichProduct } from '@utils/productEnrichment';

interface ProductStoreState {
  catalogProducts: Product[];
  isLoadingCatalog: boolean;
  catalogError: string | null;
  hasFetchedCatalog: boolean;
}

interface ProductStoreActions {
  fetchCatalog: () => Promise<void>;
  getAllProducts: () => Product[];
  getProductsByAgencyId: (agencyId: string) => Product[];
  addAgencyProduct: (product: Product) => void;
  updateAgencyProduct: (product: Product) => void;
  removeAgencyProduct: (productId: string) => void;
}

type ProductStore = ProductStoreState & ProductStoreActions;

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

export const useProductStore = create<ProductStore>((set, get) => ({
  catalogProducts: [],
  isLoadingCatalog: false,
  catalogError: null,
  hasFetchedCatalog: false,

  fetchCatalog: async () => {
    if (get().isLoadingCatalog) {
      return;
    }

    set({ isLoadingCatalog: true, catalogError: null });

    const result = await getProducts({ limit: 100 });

    if (result.ok) {
      set({
        catalogProducts: result.data.items,
        isLoadingCatalog: false,
        hasFetchedCatalog: true,
      });
      return;
    }

    set({
      catalogProducts: [],
      isLoadingCatalog: false,
      catalogError: result.error.message,
      hasFetchedCatalog: true,
    });
  },

  getAllProducts: () => get().catalogProducts,

  getProductsByAgencyId: (agencyId) =>
    get().catalogProducts.filter((product) => product.agencyId === agencyId),

  addAgencyProduct: (product) => {
    set((state) => ({
      catalogProducts: [
        product,
        ...state.catalogProducts.filter((entry) => entry.id !== product.id),
      ],
    }));
  },

  updateAgencyProduct: (product) => {
    set((state) => ({
      catalogProducts: state.catalogProducts.map((entry) =>
        entry.id === product.id ? product : entry,
      ),
    }));
  },

  removeAgencyProduct: (productId) => {
    set((state) => ({
      catalogProducts: state.catalogProducts.filter((entry) => entry.id !== productId),
    }));
  },
}));

/** Non-hook accessor for helpers outside React components. */
export function getMarketplaceProducts(): Product[] {
  return useProductStore.getState().getAllProducts();
}

export function getPopularProducts(): Product[] {
  return getMarketplaceProducts();
}

export { buildProductFromInput };
