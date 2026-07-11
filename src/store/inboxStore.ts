import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getThreads, markThreadRead as markThreadReadApi } from '@api/messages';
import { getNotifications } from '@api/notifications';
import type { MessageThread } from '@appTypes/messages';
import type { BackendNotification } from '@appTypes/notificationsApi';

interface InboxStoreState {
  unreadMessageCount: number;
  unreadNotificationCount: number;
  threadsSnapshot: MessageThread[];
  readMarkers: Record<string, number>;
}

interface InboxStoreActions {
  setUnreadFromThreads: (threads: MessageThread[]) => MessageThread[];
  setUnreadFromNotifications: (notifications: BackendNotification[]) => void;
  markThreadReadLocally: (threadId: string, lastMessageAt?: string) => void;
  markThreadReadOnServer: (threadId: string, lastMessageAt?: string) => Promise<void>;
  refreshUnreadCounts: () => Promise<void>;
  resetInbox: () => void;
}

type InboxStore = InboxStoreState & InboxStoreActions;

function parseTimestamp(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function countUnreadThreads(threads: MessageThread[]): number {
  return threads.filter((thread) => thread.unreadCount > 0).length;
}

function countUnreadNotifications(notifications: BackendNotification[]): number {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter((notification) => !notification.read).length;
}

function shouldShowThreadAsRead(thread: MessageThread, readAtMs: number): boolean {
  if (thread.unreadCount === 0) {
    return true;
  }

  const threadMs = parseTimestamp(thread.lastMessageAt);
  if (threadMs == null) {
    return true;
  }

  return threadMs <= readAtMs;
}

function applyReadMarkers(
  threads: MessageThread[],
  readMarkers: Record<string, number>,
): MessageThread[] {
  return threads.map((thread) => {
    const readAtMs = readMarkers[thread.id];
    if (readAtMs != null && shouldShowThreadAsRead(thread, readAtMs)) {
      return { ...thread, unreadCount: 0 };
    }

    return thread;
  });
}

function pruneReadMarkers(
  threads: MessageThread[],
  readMarkers: Record<string, number>,
): Record<string, number> {
  const next = { ...readMarkers };

  for (const thread of threads) {
    const readAtMs = next[thread.id];
    if (readAtMs == null) {
      continue;
    }

    const threadMs = parseTimestamp(thread.lastMessageAt);
    if (thread.unreadCount === 0 || (threadMs != null && threadMs > readAtMs)) {
      delete next[thread.id];
    }
  }

  return next;
}

function resolveReadAtMs(
  threadId: string,
  lastMessageAt: string | undefined,
  threadsSnapshot: MessageThread[],
): number {
  const candidates = [
    parseTimestamp(lastMessageAt),
    parseTimestamp(threadsSnapshot.find((thread) => thread.id === threadId)?.lastMessageAt),
    Date.now(),
  ].filter((value): value is number => value != null);

  return Math.max(...candidates);
}

const initialState: InboxStoreState = {
  unreadMessageCount: 0,
  unreadNotificationCount: 0,
  threadsSnapshot: [],
  readMarkers: {},
};

export const useInboxStore = create<InboxStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUnreadFromThreads: (threads) => {
        const readMarkers = pruneReadMarkers(threads, get().readMarkers);
        const threadsSnapshot = applyReadMarkers(threads, readMarkers);

        set({
          readMarkers,
          threadsSnapshot,
          unreadMessageCount: countUnreadThreads(threadsSnapshot),
        });

        return threadsSnapshot;
      },

      setUnreadFromNotifications: (notifications) => {
        set({ unreadNotificationCount: countUnreadNotifications(notifications) });
      },

      markThreadReadLocally: (threadId, lastMessageAt) => {
        set((state) => {
          const readAtMs = resolveReadAtMs(threadId, lastMessageAt, state.threadsSnapshot);
          const readMarkers = { ...state.readMarkers, [threadId]: readAtMs };
          const threadsSnapshot = applyReadMarkers(state.threadsSnapshot, readMarkers);

          return {
            readMarkers,
            threadsSnapshot,
            unreadMessageCount: countUnreadThreads(threadsSnapshot),
          };
        });
      },

      markThreadReadOnServer: async (threadId, lastMessageAt) => {
        get().markThreadReadLocally(threadId, lastMessageAt);
        await markThreadReadApi(threadId);
      },

      refreshUnreadCounts: async () => {
        try {
          const [threadsResult, notificationsResult] = await Promise.all([
            getThreads(),
            getNotifications(),
          ]);

          if (threadsResult.ok) {
            get().setUnreadFromThreads(threadsResult.data);
          }

          if (notificationsResult.ok) {
            get().setUnreadFromNotifications(notificationsResult.data);
          }
        } catch {
          // Inbox sync must never break dashboard screens.
        }
      },

      resetInbox: () => {
        set(initialState);
      },
    }),
    {
      name: 'civicbuild-inbox',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ readMarkers: state.readMarkers }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as { readMarkers?: Record<string, string | number> };
        if (!state?.readMarkers) {
          return { readMarkers: {} };
        }

        const readMarkers: Record<string, number> = {};
        for (const [threadId, value] of Object.entries(state.readMarkers)) {
          if (typeof value === 'number' && Number.isFinite(value)) {
            readMarkers[threadId] = value;
            continue;
          }

          if (typeof value === 'string') {
            const parsed = Date.parse(value);
            if (Number.isFinite(parsed)) {
              readMarkers[threadId] = parsed;
            }
          }
        }

        return { readMarkers };
      },
    },
  ),
);

export function clearPersistedInboxState(): void {
  useInboxStore.getState().resetInbox();
  void useInboxStore.persist.clearStorage();
}
