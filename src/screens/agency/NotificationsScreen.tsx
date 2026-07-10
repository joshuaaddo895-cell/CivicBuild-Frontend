import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatNotificationDate, getNotifications, markNotificationRead } from '@api/notifications';
import type { NotificationsScreenProps } from '@appTypes/navigation';
import type { BackendNotification } from '@appTypes/notificationsApi';
import { EmptyState, ScreenHeader } from '@components/agency';
import theme from '@theme/index';

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getNotifications();

    if (result.ok) {
      setNotifications(result.data);
    } else {
      setNotifications([]);
      setError(result.error.message);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (notification: BackendNotification) => {
    if (notification.read) {
      return;
    }

    const result = await markNotificationRead(notification.id);

    if (result.ok) {
      setNotifications((current) =>
        current.map((entry) => (entry.id === notification.id ? { ...entry, read: true } : entry)),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Notifications" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Agency notifications and delivery updates will appear here.
        </Text>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <EmptyState icon="error-outline" title="Could not load notifications" message={error} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-none"
            title="No notifications yet"
            message="You are all caught up. New activity from delivery providers and orders will show up here."
          />
        ) : (
          <View style={styles.list}>
            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => void handleNotificationPress(notification)}
                style={({ pressed }) => [
                  styles.card,
                  !notification.read && styles.cardUnread,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={notification.title}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  <Text style={styles.cardDate}>
                    {formatNotificationDate(notification.createdAt)}
                  </Text>
                </View>
                <Text style={styles.cardBody}>{notification.body}</Text>
                {!notification.read ? (
                  <View style={styles.unreadBadge}>
                    <MaterialIcons
                      name="fiber-manual-record"
                      size={8}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.unreadText}>Unread</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
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
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
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
