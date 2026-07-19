import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SavedItem, SavedItemType } from '@appTypes/saved';

interface SavedState {
  items: SavedItem[];
}

interface SavedActions {
  toggleSaved: (id: string, type: SavedItemType) => void;
  isSaved: (id: string, type: SavedItemType) => boolean;
}

type SavedStore = SavedState & SavedActions;

const initialState: SavedState = {
  items: [],
};

const migrateSavedState = (persistedState: unknown): SavedState => {
  if (!persistedState || typeof persistedState !== 'object') {
    return initialState;
  }

  const state = persistedState as Partial<SavedState>;

  return {
    items: Array.isArray(state.items) ? state.items : [],
  };
};

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleSaved: (id, type) => {
        const existing = get().items.find((item) => item.id === id && item.type === type);

        if (existing) {
          set({
            items: get().items.filter((item) => !(item.id === id && item.type === type)),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              id,
              type,
              savedAt: new Date().toISOString(),
            },
          ],
        });
      },

      isSaved: (id, type) => {
        return get().items.some((item) => item.id === id && item.type === type);
      },
    }),
    {
      name: 'civicbuild-saved-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState) => migrateSavedState(persistedState),
    },
  ),
);
