import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AgencyPortfolioImage } from '@appTypes/verificationDocuments';

interface AgencyPortfolioState {
  imagesByAgencyId: Record<string, AgencyPortfolioImage[]>;
}

interface AgencyPortfolioActions {
  addPortfolioImage: (agencyId: string, image: AgencyPortfolioImage) => void;
  getPortfolioImages: (agencyId: string) => AgencyPortfolioImage[];
}

type AgencyPortfolioStore = AgencyPortfolioState & AgencyPortfolioActions;

export const useAgencyPortfolioStore = create<AgencyPortfolioStore>()(
  persist(
    (set, get) => ({
      imagesByAgencyId: {},

      addPortfolioImage: (agencyId, image) => {
        set((state) => {
          const existing = state.imagesByAgencyId[agencyId] ?? [];
          return {
            imagesByAgencyId: {
              ...state.imagesByAgencyId,
              [agencyId]: [...existing, image],
            },
          };
        });
      },

      getPortfolioImages: (agencyId) => get().imagesByAgencyId[agencyId] ?? [],
    }),
    {
      name: 'civicbuild-agency-portfolio-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ imagesByAgencyId: state.imagesByAgencyId }),
    },
  ),
);
