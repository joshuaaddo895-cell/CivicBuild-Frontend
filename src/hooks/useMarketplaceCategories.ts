import { useCallback, useEffect, useState } from 'react';

import { getCategories } from '@api/catalog';
import type { MarketplaceCategory } from '@appTypes/marketplace';
import { MARKETPLACE_CATEGORIES } from '@constants/marketplaceData';

const ALL_CATEGORY: MarketplaceCategory = { id: 'all', label: 'All' };

export function useMarketplaceCategories() {
  const [categories, setCategories] = useState<MarketplaceCategory[]>(MARKETPLACE_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getCategories();

    if (result.ok && result.data.length > 0) {
      setCategories([
        ALL_CATEGORY,
        ...result.data.map((category) => ({
          id: category.id,
          label: category.name,
        })),
      ]);
    } else if (!result.ok) {
      setError(result.error.message);
      setCategories(MARKETPLACE_CATEGORIES);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { categories, isLoading, error, reload };
}
