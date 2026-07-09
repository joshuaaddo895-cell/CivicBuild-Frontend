import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ChatMessage } from '@appTypes/messages';
import type { ConversationDetailScreenProps } from '@appTypes/navigation';
import {
  CHAT_MESSAGES_BY_THREAD,
  findMessageThread,
  formatMessageTimestamp,
} from '@constants/messagesData';
import theme from '@theme/index';

export default function ConversationDetailScreen({
  navigation,
  route,
}: ConversationDetailScreenProps) {
  const { threadId, participantName, participantLogoUri } = route.params;
  const thread = findMessageThread(threadId);
  const displayName = thread?.participantName ?? participantName ?? 'Conversation';
  const displayLogoUri = thread?.participantLogoUri ?? participantLogoUri;
  const initialMessages = CHAT_MESSAGES_BY_THREAD[threadId] ?? [];

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((message) => ({ ...message, threadId })),
  );
  const [draft, setDraft] = useState('');

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    [messages],
  );

  const handleSend = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        threadId,
        text,
        sentAt: new Date().toISOString(),
        isOutgoing: true,
      },
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back to messages"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
          {displayName}
        </Text>
        {displayLogoUri ? (
          <Image
            source={{ uri: displayLogoUri }}
            style={styles.headerAvatar}
            contentFit="cover"
            accessibilityLabel={`${displayName} logo`}
          />
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageRow,
              item.isOutgoing ? styles.messageRowOutgoing : styles.messageRowIncoming,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isOutgoing ? styles.messageTextOutgoing : styles.messageTextIncoming,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  item.isOutgoing ? styles.messageTimeOutgoing : styles.messageTimeIncoming,
                ]}
              >
                {formatMessageTimestamp(item.sentAt)}
              </Text>
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.input}
            multiline
            accessibilityLabel="Message input"
          />
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <MaterialIcons name="send" size={20} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 32,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceContainer,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackMd,
    gap: theme.spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowOutgoing: {
    justifyContent: 'flex-end',
  },
  messageRowIncoming: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  bubbleOutgoing: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  bubbleIncoming: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderBottomLeftRadius: theme.borderRadius.sm,
  },
  messageText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
  },
  messageTextOutgoing: {
    color: theme.colors.onPrimary,
  },
  messageTextIncoming: {
    color: theme.colors.onSurface,
  },
  messageTime: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    alignSelf: 'flex-end',
  },
  messageTimeOutgoing: {
    color: `${theme.colors.onPrimary}CC`,
  },
  messageTimeIncoming: {
    color: theme.colors.onSurfaceVariant,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
});
