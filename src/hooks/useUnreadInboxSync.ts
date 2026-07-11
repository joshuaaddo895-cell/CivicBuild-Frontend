import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useInboxStore } from '@store/inboxStore';

export function useUnreadInboxSync(): void {
  const refreshUnreadCounts = useInboxStore((state) => state.refreshUnreadCounts);

  useFocusEffect(
    useCallback(() => {
      void refreshUnreadCounts();
    }, [refreshUnreadCounts]),
  );
}
