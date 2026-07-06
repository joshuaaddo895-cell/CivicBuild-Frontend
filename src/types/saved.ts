export type SavedItemType = 'product' | 'supplier' | 'agency';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  savedAt: string;
}

export interface SavedItemDetail {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle: string;
  imageUri?: string;
  priceLabel?: string;
}
