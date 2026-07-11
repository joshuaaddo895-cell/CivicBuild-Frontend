import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { approvePersonnel, rejectPersonnel } from '@api/agencies';
import { formatNotificationDate, getNotifications, markNotificationRead } from '@api/notifications';
import type { BackendNotification } from '@appTypes/notificationsApi';
import { EmptyState, ScreenHeader } from '@components/agency';
import { useAuthStore } from '@store/authStore';
import { useInboxStore } from '@store/inboxStore';
import theme from '@theme/index';
import {
  getConversationParamsFromNotification,
  getPersonnelIdFromNotification,
  isPendingPersonnelNotification,
} from '@utils/messageNotificationNavigation';

interface NotificationsScreenProps {
  navigation: {
    goBack: () => void;
    getParent: () => { navigate: (name: string, params?: object) => void } | undefined;
    navigate?: (screen: string, params?: object) => void;
  };
}

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const accountType = useAuthStore((state) => state.accountType);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const setUnreadFromNotifications = useInboxStore((state) => state.setUnreadFromNotifications);
  const markThreadReadOnServer = useInboxStore((state) => state.markThreadReadOnServer);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getNotifications();

    if (result.ok) {
      setNotifications(result.data);
      setUnreadFromNotifications(result.data);
    } else {
      setNotifications([]);
      setError(result.error.message);
    }

    setIsLoading(false);
  }, [setUnreadFromNotifications]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  const markNotificationAsRead = useCallback(
    async (notification: BackendNotification) => {
      if (notification.read) {
        return;
      }

      const result = await markNotificationRead(notification.id);
      if (!result.ok) {
        return;
      }

      setNotifications((current) => {
        const updated = current.map((entry) =>
          entry.id === notification.id ? { ...entry, read: true } : entry,
        );
        setUnreadFromNotifications(updated);
        return updated;
      });
    },
    [setUnreadFromNotifications],
  );

  const openMessageConversation = (notification: BackendNotification) => {
    const conversationParams = getConversationParamsFromNotification(notification);

    if (!conversationParams) {
      navigation.getParent()?.navigate('Messages', { screen: 'MessagesList' });
      return;
    }

    void markThreadReadOnServer(
      conversationParams.threadId,
      notification.data?.lastMessageAt ?? notification.data?.last_message_at,
    );

    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: conversationParams,
    });
  };

  const openPersonnelScreen = () => {
    if (navigation.navigate) {
      navigation.navigate('AgencyPersonnel');
      return;
    }

    navigation.getParent()?.navigate('Home', { screen: 'AgencyPersonnel' });
  };

  const handlePersonnelDecision = async (
    notification: BackendNotification,
    decision: 'approve' | 'reject',
  ) => {
    const personnelId = getPersonnelIdFromNotification(notification);
    if (!personnelId) {
      setActionError(
        'This personnel request is missing an id. Open Delivery Personnel to review manually.',
      );
      openPersonnelScreen();
      return;
    }

    setActionId(`${decision}-${notification.id}`);
    setActionError(null);

    const result =
      decision === 'approve'
        ? await approvePersonnel(personnelId)
        : await rejectPersonnel(personnelId);

    if (!result.ok) {
      setActionError(result.error.message);
      setActionId(null);
      return;
    }

    await markNotificationAsRead(notification);
    setActionId(null);
    void loadNotifications();
  };

  const handleNotificationPress = async (notification: BackendNotification) => {
    if (notification.type === 'message') {
      await markNotificationAsRead(notification);
      openMessageConversation(notification);
      return;
    }

    if (notification.type === 'personnel' && accountType === 'construction') {
      await markNotificationAsRead(notification);
      openPersonnelScreen();
      return;
    }

    await markNotificationAsRead(notification);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Notifications" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Message alerts, delivery personnel requests, orders, and account updates appear here.
        </Text>

        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error && notifications.length === 0 ? (
          <EmptyState icon="error-outline" title="Could not load notifications" message={error} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-none"
            title="No notifications yet"
            message="You are all caught up. New messages and activity will show up here."
          />
        ) : (
          <View style={styles.list}>
            {notifications.map((notification) => {
              const isUnread = !notification.read;
              const isMessage = notification.type === 'message';
              const isPersonnel = notification.type === 'personnel';
              const showPersonnelActions =
                isPersonnel &&
                accountType === 'construction' &&
                isPendingPersonnelNotification(notification);
              const isActing = actionId?.endsWith(notification.id) ?? false;
              const CardContainer = showPersonnelActions ? View : Pressable;
              const cardPressProps = showPersonnelActions
                ? {}
                : {
                    onPress: () => void handleNotificationPress(notification),
                    accessibilityRole: 'button' as const,
                  };

              return (
                <CardContainer
                  key={notification.id}
                  {...cardPressProps}
                  style={[styles.card, isUnread ? styles.cardUnread : styles.cardRead]}
                  accessibilityLabel={notification.title}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      {isMessage ? (
                        <MaterialIcons
                          name="chat-bubble-outline"
                          size={18}
                          color={isUnread ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                      ) : null}
                      {isPersonnel ? (
                        <MaterialIcons
                          name="local-shipping"
                          size={18}
                          color={isUnread ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                      ) : null}
                      <Text
                        style={[styles.cardTitle, !isUnread && styles.cardTitleRead]}
                        numberOfLines={2}
                      >
                        {notification.title}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>
                      {formatNotificationDate(notification.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.cardBody, !isUnread && styles.cardBodyRead]}>
                    {notification.body}
                  </Text>

                  {showPersonnelActions ? (
                    <View style={styles.personnelActions}>
                      <Pressable
                        onPress={() => void handlePersonnelDecision(notification, 'approve')}
                        disabled={isActing}
                        style={({ pressed }) => [
                          styles.personnelButton,
                          styles.approveButton,
                          pressed && styles.personnelButtonPressed,
                        ]}
                      >
                        {isActing && actionId?.startsWith('approve-') ? (
                          <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                        ) : (
                          <Text style={styles.approveText}>Approve</Text>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => void handlePersonnelDecision(notification, 'reject')}
                        disabled={isActing}
                        style={({ pressed }) => [
                          styles.personnelButton,
                          styles.rejectButton,
                          pressed && styles.personnelButtonPressed,
                        ]}
                      >
                        <Text style={styles.rejectText}>Reject</Text>
                      </Pressable>
                      <Pressable
                        onPress={openPersonnelScreen}
                        style={({ pressed }) => [
                          styles.personnelButton,
                          styles.viewButton,
                          pressed && styles.personnelButtonPressed,
                        ]}
                      >
                        <Text style={styles.viewText}>View all</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {!showPersonnelActions ? (
                    <Pressable
                      onPress={() => void handleNotificationPress(notification)}
                      style={({ pressed }) => [styles.openRow, pressed && styles.cardPressed]}
                    >
                      <Text style={styles.openText}>
                        {isMessage ? 'Open chat' : isPersonnel ? 'Review request' : 'Mark read'}
                      </Text>
                    </Pressable>
                  ) : null}

                  {isUnread ? (
                    <View style={styles.unreadBadge}>
                      <MaterialIcons
                        name="fiber-manual-record"
                        size={8}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.unreadText}>Unread</Text>
                    </View>
                  ) : null}
                </CardContainer>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  intro: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  list: {
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.xs,
  },
  cardUnread: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  cardRead: {
    opacity: 0.72,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  cardTitle: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  cardTitleRead: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  cardDate: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  cardBody: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  cardBodyRead: {
    color: theme.colors.outline,
  },
  personnelActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  personnelButton: {
    minWidth: 72,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: theme.colors.primary,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  viewButton: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  personnelButtonPressed: {
    opacity: 0.85,
  },
  approveText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimary,
    textTransform: 'uppercase',
  },
  rejectText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.error,
    textTransform: 'uppercase',
  },
  viewText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  openRow: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  openText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  unreadText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
});
