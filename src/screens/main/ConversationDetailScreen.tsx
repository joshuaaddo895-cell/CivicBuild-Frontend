import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMessageTimestamp, getThreadMessages, sendMessage, startThread } from '@api/messages';
import type { ChatMessage } from '@appTypes/messages';
import type { ConversationDetailScreenProps } from '@appTypes/navigation';
import { useInboxStore } from '@store/inboxStore';
import theme from '@theme/index';
import { getMessageParticipantLabel } from '@utils/messageThreadDisplay';

const CONVERSATION_POLL_MS = 5000;

export default function ConversationDetailScreen({
  navigation,
  route,
}: ConversationDetailScreenProps) {
  const {
    threadId: routeThreadId,
    agencyId,
    supplierId,
    participantName,
    participantLogoUri,
    participantLabel: routeParticipantLabel,
  } = route.params ?? {};

  const threadIdRef = useRef<string | null>(routeThreadId ?? null);
  const hasLoadedMessagesRef = useRef(false);
  const hasMarkedReadRef = useRef(false);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(routeThreadId ?? null);
  const [displayName, setDisplayName] = useState(participantName ?? 'Conversation');
  const [displayLabel, setDisplayLabel] = useState(routeParticipantLabel ?? 'Contact');
  const [displayLogoUri, setDisplayLogoUri] = useState(participantLogoUri);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markThreadReadOnServer = useInboxStore((state) => state.markThreadReadOnServer);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    [messages],
  );

  useEffect(() => {
    const threadId = routeThreadId ?? activeThreadId ?? threadIdRef.current;
    if (!threadId) {
      return;
    }

    const knownThread = useInboxStore
      .getState()
      .threadsSnapshot.find((thread) => thread.id === threadId);
    if (!knownThread) {
      return;
    }

    if (!participantName || participantName === 'Conversation') {
      setDisplayName(knownThread.participantName);
    }

    if (!routeParticipantLabel) {
      setDisplayLabel(knownThread.participantLabel);
    }

    if (!participantLogoUri && knownThread.participantLogoUri) {
      setDisplayLogoUri(knownThread.participantLogoUri);
    }
  }, [activeThreadId, participantLogoUri, participantName, routeParticipantLabel, routeThreadId]);

  const refreshMessages = useCallback(
    async (threadId: string, silent = true) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const messagesResult = await getThreadMessages(threadId);

      if (messagesResult.ok) {
        setMessages(messagesResult.data);
        hasLoadedMessagesRef.current = true;

        if (!hasMarkedReadRef.current) {
          const threadLastMessageAt = useInboxStore
            .getState()
            .threadsSnapshot.find((thread) => thread.id === threadId)?.lastMessageAt;
          const latestMessageAt = messagesResult.data.reduce<string | undefined>(
            (latest, message) => {
              if (!latest || new Date(message.sentAt).getTime() > new Date(latest).getTime()) {
                return message.sentAt;
              }
              return latest;
            },
            undefined,
          );

          void markThreadReadOnServer(threadId, threadLastMessageAt ?? latestMessageAt);
          hasMarkedReadRef.current = true;
        }
      } else if (!silent || !hasLoadedMessagesRef.current) {
        setError(messagesResult.error.message);
        setMessages([]);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [markThreadReadOnServer],
  );

  const resolveThreadId = useCallback(async (): Promise<string | null> => {
    let threadId = threadIdRef.current ?? activeThreadId ?? routeThreadId ?? null;

    if (threadId) {
      return threadId;
    }

    if (!agencyId && !supplierId) {
      return null;
    }

    const startResult = await startThread(agencyId ? { agencyId } : { supplierId: supplierId! });

    if (!startResult.ok) {
      setError(startResult.error.message);
      return null;
    }

    threadId = startResult.data.id;
    threadIdRef.current = threadId;
    setActiveThreadId(threadId);
    setDisplayName(startResult.data.participantName);
    setDisplayLabel(startResult.data.participantLabel);
    setDisplayLogoUri(startResult.data.participantLogoUri);

    return threadId;
  }, [activeThreadId, agencyId, routeThreadId, supplierId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let pollTimer: ReturnType<typeof setInterval> | null = null;

      void (async () => {
        const threadId = await resolveThreadId();

        if (cancelled) {
          return;
        }

        if (!threadId) {
          setError((current) => current ?? 'Conversation not found.');
          setIsLoading(false);
          return;
        }

        threadIdRef.current = threadId;
        await refreshMessages(threadId, hasLoadedMessagesRef.current);

        if (cancelled) {
          return;
        }

        pollTimer = setInterval(() => {
          const currentThreadId = threadIdRef.current;
          if (currentThreadId) {
            void refreshMessages(currentThreadId, true);
          }
        }, CONVERSATION_POLL_MS);
      })();

      return () => {
        cancelled = true;
        hasMarkedReadRef.current = false;
        if (pollTimer) {
          clearInterval(pollTimer);
        }
      };
    }, [refreshMessages, resolveThreadId]),
  );

  const handleSend = async () => {
    const text = draft.trim();
    const threadId = threadIdRef.current ?? activeThreadId ?? routeThreadId;

    if (!text || !threadId || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    const result = await sendMessage(threadId, { text });

    if (!result.ok) {
      setError(result.error.message);
      setIsSending(false);
      return;
    }

    setMessages((current) => {
      const exists = current.some((message) => message.id === result.data.id);
      if (exists) {
        return current;
      }
      return [...current, result.data];
    });
    setDraft('');
    setIsSending(false);
  };

  const handleManualRefresh = useCallback(() => {
    const threadId = threadIdRef.current ?? activeThreadId ?? routeThreadId;
    if (threadId) {
      void refreshMessages(threadId, true);
    }
  }, [activeThreadId, refreshMessages, routeThreadId]);

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
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
            {displayName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {displayLabel || getMessageParticipantLabel('unknown')}
          </Text>
        </View>
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

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && sortedMessages.length === 0 ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              void (async () => {
                const threadId = await resolveThreadId();
                if (threadId) {
                  await refreshMessages(threadId, false);
                }
              })();
            }}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sortedMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleManualRefresh}
              tintColor={theme.colors.primary}
            />
          }
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
      )}

      {error && sortedMessages.length > 0 ? <Text style={styles.inlineError}>{error}</Text> : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.input}
            multiline
            editable={!isLoading && !isSending}
            accessibilityLabel="Message input"
          />
          <Pressable
            onPress={() => void handleSend()}
            disabled={isLoading || isSending || !draft.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              (isLoading || isSending || !draft.trim()) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {isSending ? (
              <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            ) : (
              <MaterialIcons name="send" size={20} color={theme.colors.onPrimary} />
            )}
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
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  inlineError: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.xs,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackMd,
    gap: theme.spacing.sm,
    flexGrow: 1,
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
