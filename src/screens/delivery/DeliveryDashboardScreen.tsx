import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency } from '@api/agencies';
import { getDeliveryJobStatusLabel, getMyDeliveryJobs, getMyDeliveryProvider } from '@api/delivery';
import type { BackendDeliveryJob } from '@appTypes/deliveryApi';
import type { DeliveryDashboardScreenProps } from '@appTypes/navigation';
import { DashboardHeader } from '@components/dashboard';
import { useUnreadInboxSync } from '@hooks/useUnreadInboxSync';
import { useAuthStore } from '@store/authStore';
import { useInboxStore } from '@store/inboxStore';
import theme from '@theme/index';
import { formatUserDisplayName } from '@utils/userDisplay';
import { getUserInitials } from '@utils/userInitials';

export default function DeliveryDashboardScreen({ navigation }: DeliveryDashboardScreenProps) {
  const user = useAuthStore((state) => state.user);
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);

  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BackendDeliveryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unreadNotificationCount = useInboxStore((state) => state.unreadNotificationCount);

  useUnreadInboxSync();

  const displayName = deliveryProviderProfile?.fullName?.trim() || formatUserDisplayName(user);
  const userInitials = getUserInitials(user, displayName);
  const userAvatarUri = user?.avatar ?? deliveryProviderProfile?.profileImageUri ?? null;

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [providerResult, jobsResult] = await Promise.all([
      getMyDeliveryProvider(),
      getMyDeliveryJobs(),
    ]);

    if (!providerResult.ok) {
      setError(providerResult.error.message);
      setJobs([]);
      setAgencyName(null);
      setIsLoading(false);
      return;
    }

    const agencyId = providerResult.data.constructionAgencyId;

    if (agencyId) {
      const agencyResult = await getAgency(agencyId);
      setAgencyName(agencyResult.ok ? agencyResult.data.name : null);
    } else {
      setAgencyName(null);
    }

    setJobs(jobsResult.ok ? jobsResult.data : []);
    if (!jobsResult.ok) {
      setError(jobsResult.error.message);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeJobs = jobs.filter((job) => job.status !== 'delivered');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader
        userInitials={userInitials}
        userAvatarUri={userAvatarUri}
        onAvatarPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileMain' })}
        onSettingsPress={() => navigation.navigate('Settings')}
        hasUnreadNotifications={unreadNotificationCount > 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.greeting} accessibilityRole="header">
            Delivery Dashboard
          </Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.heroSubtitle}>
            View assigned jobs and manage your delivery activity.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Associated Company</Text>
              <Text style={styles.cardValue}>
                {agencyName ?? 'No company linked yet — update your profile anytime.'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Active Jobs</Text>
              {activeJobs.length === 0 ? (
                <>
                  <Text style={styles.cardValue}>No active delivery jobs right now.</Text>
                  <Text style={styles.cardHint}>
                    New assignments from your construction agency will appear here.
                  </Text>
                </>
              ) : (
                <View style={styles.jobsList}>
                  {activeJobs.map((job) => (
                    <View key={job.id} style={styles.jobCard}>
                      <Text style={styles.jobTitle}>Order {job.orderNumber}</Text>
                      <Text style={styles.jobMeta}>
                        {getDeliveryJobStatusLabel(job.status)} · {job.pickupAddress} →{' '}
                        {job.deliveryAddress}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
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
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  hero: {
    gap: theme.spacing.xs,
  },
  greeting: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  card: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  cardHint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  jobsList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  jobCard: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
    gap: 2,
  },
  jobTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  jobMeta: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
});
