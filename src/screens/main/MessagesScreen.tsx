import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MessagesListScreenProps } from '@appTypes/navigation';
import { formatMessageTimestamp, MESSAGE_THREADS } from '@constants/messagesData';
import theme from '@theme/index';

export default function MessagesScreen({ navigation }: MessagesListScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Messages
      </Text>

      {MESSAGE_THREADS.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={theme.colors.outline} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you contact suppliers or agencies, your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={MESSAGE_THREADS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const hasUnread = item.unreadCount > 0;

            return (
              <Pressable
                onPress={() => navigation.navigate('ConversationDetail', { threadId: item.id })}
                style={({ pressed }) => [styles.threadRow, pressed && styles.threadRowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`Conversation with ${item.participantName}`}
              >
                <Image
                  source={{ uri: item.participantLogoUri }}
                  style={styles.avatar}
                  contentFit="cover"
                  accessibilityLabel={`${item.participantName} logo`}
                />
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
