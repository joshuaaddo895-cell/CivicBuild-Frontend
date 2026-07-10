import { create } from 'zustand';

import { getSavedItems, removeSavedItem, saveItem } from '@api/saved';
import type { SavedItem, SavedItemType } from '@appTypes/saved';

interface SavedState {
  items: SavedItem[];
  isLoading: boolean;
  error: string | null;
  hasSynced: boolean;
}

interface SavedActions {
  syncFromServer: () => Promise<void>;
  toggleSaved: (id: string, type: SavedItemType) => Promise<void>;
  isSaved: (id: string, type: SavedItemType) => boolean;
}

type SavedStore = SavedState & SavedActions;

export const useSavedStore = create<SavedStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  hasSynced: false,

  syncFromServer: async () => {
    set({ isLoading: true, error: null });
    const result = await getSavedItems();
    if (result.ok) {
      set({ items: result.data, isLoading: false, hasSynced: true });
      return;
    }
    set({ isLoading: false, error: result.error.message, hasSynced: true });
  },

  toggleSaved: async (id, type) => {
    const existing = get().items.find((item) => item.id === id && item.type === type);
    const previous = get().items;

    if (existing) {
      set({ items: previous.filter((item) => !(item.id === id && item.type === type)) });
      const result = await removeSavedItem(type, id);
      if (!result.ok) {
        set({ items: previous, error: result.error.message });
      }
      return;
    }

    const optimistic: SavedItem = { id, type, savedAt: new Date().toISOString() };
    set({ items: [...previous, optimistic] });
    const result = await saveItem({ id, type });
    if (result.ok) {
      set({
        items: previous
          .filter((item) => !(item.id === id && item.type === type))
          .concat(result.data),
      });
      return;
    }
    set({ items: previous, error: result.error.message });
  },

  isSaved: (id, type) => {
    return get().items.some((item) => item.id === id && item.type === type);
  },
}));
