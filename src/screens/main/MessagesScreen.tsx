import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMessageTimestamp, getThreads } from '@api/messages';
import type { MessageThread } from '@appTypes/messages';
import type { MessagesListScreenProps } from '@appTypes/navigation';
import theme from '@theme/index';

export default function MessagesScreen({ navigation }: MessagesListScreenProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getThreads();

    if (result.ok) {
      setThreads(result.data);
    } else {
      setThreads([]);
      setError(result.error.message);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Messages
      </Text>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={styles.emptyTitle}>Could not load messages</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
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
          renderItem={({ item }) => {
            const hasUnread = item.unreadCount > 0;

            return (
              <Pressable
                onPress={() =>
                  navigation.navigate('ConversationDetail', {
                    threadId: item.id,
                    participantName: item.participantName,
                    participantLogoUri: item.participantLogoUri,
                  })
                }
                style={({ pressed }) => [styles.threadRow, pressed && styles.threadRowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`Conversation with ${item.participantName}`}
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
                    <MaterialIcons
                      name="business"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}
                <View style={styles.threadBody}>
                  <View style={styles.threadHeader}>
                    <Text
                      style={[styles.participantName, hasUnread && styles.unreadText]}
                      numberOfLines={1}
                    >
                      {item.participantName}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatMessageTimestamp(item.lastMessageAt)}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text
                      style={[styles.preview, hasUnread && styles.unreadText]}
                      numberOfLines={1}
                    >
                      {item.lastMessage}
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
  },
  threadBody: {
    flex: 1,
    gap: 4,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  participantName: {
    flex: 1,
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
