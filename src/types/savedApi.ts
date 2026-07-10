import type { SavedItemType } from '@appTypes/saved';

export interface BackendSavedItem {
  id: string;
  type: SavedItemType;
  savedAt: string;
}

export interface SaveItemRequest {
  id: string;
  type: SavedItemType;
}
