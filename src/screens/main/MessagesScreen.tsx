import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMessageTimestamp, getThreads } from '@api/messages';
import type { MessageThread } from '@appTypes/messages';
import type { MessagesListScreenProps } from '@appTypes/navigation';
import { useUnreadInboxSync } from '@hooks/useUnreadInboxSync';
import { useInboxStore } from '@store/inboxStore';
import theme from '@theme/index';
import {
  getParticipantAvatarIcon,
  getThreadInitials,
  sortThreadsByRecent,
} from '@utils/messageThreadDisplay';

export default function MessagesScreen({ navigation }: MessagesListScreenProps) {
  useUnreadInboxSync();

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const setUnreadFromThreads = useInboxStore((state) => state.setUnreadFromThreads);
  const markThreadReadOnServer = useInboxStore((state) => state.markThreadReadOnServer);
  const threadsSnapshot = useInboxStore((state) => state.threadsSnapshot);

  useEffect(() => {
    if (hasLoadedRef.current && threadsSnapshot.length > 0) {
      setThreads(threadsSnapshot);
    }
  }, [threadsSnapshot]);

  const loadThreads = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await getThreads();

      if (result.ok) {
        const mergedThreads = sortThreadsByRecent(setUnreadFromThreads(result.data));
        setThreads(mergedThreads);
        hasLoadedRef.current = true;
      } else if (!silent || !hasLoadedRef.current) {
        setThreads([]);
        setError(result.error.message);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [setUnreadFromThreads],
  );

  const handleThreadPress = useCallback(
    (thread: MessageThread) => {
      void markThreadReadOnServer(thread.id, thread.lastMessageAt);
      setThreads((current) =>
        current.map((entry) => (entry.id === thread.id ? { ...entry, unreadCount: 0 } : entry)),
      );

      navigation.navigate('ConversationDetail', {
        threadId: thread.id,
        participantName: thread.participantName,
        participantLogoUri: thread.participantLogoUri,
        participantLabel: thread.participantLabel,
      });
    },
    [markThreadReadOnServer, navigation],
  );

  useFocusEffect(
    useCallback(() => {
      const snapshot = useInboxStore.getState().threadsSnapshot;
      if (snapshot.length > 0) {
        setThreads(snapshot);
      }
      void loadThreads(hasLoadedRef.current);
    }, [loadThreads]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Messages
      </Text>
      {threads.length > 0 ? (
        <Text style={styles.screenSubtitle}>
          {threads.length} conversation{threads.length === 1 ? '' : 's'} — tap one to open the chat
        </Text>
      ) : null}

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && threads.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={styles.emptyTitle}>Could not load messages</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable
            onPress={() => void loadThreads(false)}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={theme.colors.outline} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you contact suppliers or agencies, your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadThreads(true)}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => {
            const hasUnread = item.unreadCount > 0;
            const avatarIcon = getParticipantAvatarIcon(item.participantKind);

            return (
              <Pressable
                onPress={() => handleThreadPress(item)}
                style={({ pressed }) => [styles.threadRow, pressed && styles.threadRowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`Conversation with ${item.participantName}, ${item.participantLabel}`}
              >
                {item.participantLogoUri ? (
                  <Image
                    source={{ uri: item.participantLogoUri }}
                    style={styles.avatar}
                    contentFit="cover"
                    accessibilityLabel={`${item.participantName} logo`}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {getThreadInitials(item.participantName)}
                    </Text>
                  </View>
                )}
                <View style={styles.threadBody}>
                  <View style={styles.threadHeader}>
                    <View style={styles.titleBlock}>
                      <Text
                        style={[styles.participantName, hasUnread && styles.unreadText]}
                        numberOfLines={1}
                      >
                        {item.participantName}
                      </Text>
                      <View style={styles.kindBadge}>
                        <MaterialIcons name={avatarIcon} size={12} color={theme.colors.primary} />
                        <Text style={styles.kindText}>{item.participantLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.timestamp}>
                      {formatMessageTimestamp(item.lastMessageAt)}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text
                      style={[styles.preview, hasUnread && styles.unreadText]}
                      numberOfLines={1}
                    >
                      {item.lastMessage || 'No messages yet'}
                    </Text>
                    {hasUnread ? (
                      <View style={styles.unreadDot} accessibilityLabel="Unread messages" />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
  },
  screenTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  screenSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.stackMd,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  listContent: {
    paddingBottom: theme.spacing.stackLg,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  threadRowPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
  },
  avatarInitials: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '700',
  },
  threadBody: {
    flex: 1,
    gap: 4,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kindText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  participantName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  unreadText: {
    fontWeight: '700',
  },
  timestamp: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  preview: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
