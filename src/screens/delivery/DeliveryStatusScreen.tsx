import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getDeliveryJobStatusLabel,
  getMyDeliveryJobs,
  updateDeliveryJobStatus,
} from '@api/delivery';
import type { BackendDeliveryJob } from '@appTypes/deliveryApi';
import { ScreenHeader } from '@components/agency';
import theme from '@theme/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DeliveryStatusScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<BackendDeliveryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const jobsResult = await getMyDeliveryJobs();

    if (jobsResult.ok) {
      setJobs(jobsResult.data);
    } else {
      setError(jobsResult.error.message);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleCancelJob = (jobId: string, orderNumber: string) => {
    Alert.alert(
      'Cancel Delivery',
      `Are you sure you want to cancel delivery for Order ${orderNumber}?`,
      [
        { text: 'Keep Job', style: 'cancel' },
        {
          text: 'Cancel Delivery',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setIsUpdating(true);
              const result = await updateDeliveryJobStatus(jobId, 'cancelled');
              if (result.ok) {
                setJobs((current) =>
                  current.map((job) => (job.id === jobId ? { ...job, status: 'cancelled' } : job)),
                );
              } else {
                Alert.alert('Cancellation failed', result.error.message);
              }
              setIsUpdating(false);
            })();
          },
        },
      ],
    );
  };

  const activeJobs = jobs.filter((job) => job.status === 'assigned' || job.status === 'in_transit');
  const pastJobs = jobs.filter((job) => job.status === 'delivered' || job.status === 'cancelled');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Delivery Status" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Deliveries</Text>
              {activeJobs.length === 0 ? (
                <Text style={styles.emptyText}>No active delivery jobs.</Text>
              ) : (
                <View style={styles.jobsList}>
                  {activeJobs.map((job) => (
                    <View key={job.id} style={styles.jobCard}>
                      <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>Order {job.orderNumber}</Text>
                        <View style={styles.statusPill}>
                          <Text style={styles.statusPillText}>
                            {getDeliveryJobStatusLabel(job.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.jobMeta}>
                        {job.pickupAddress} → {job.deliveryAddress}
                      </Text>
                      <View style={styles.jobActions}>
                        <Pressable
                          onPress={() => handleCancelJob(job.id, job.orderNumber)}
                          disabled={isUpdating}
                          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                        >
                          <MaterialIcons name="cancel" size={16} color={theme.colors.error} />
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past Deliveries</Text>
              {pastJobs.length === 0 ? (
                <Text style={styles.emptyText}>No past deliveries.</Text>
              ) : (
                <View style={styles.jobsList}>
                  {pastJobs.map((job) => (
                    <View key={job.id} style={[styles.jobCard, styles.jobCardInactive]}>
                      <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>Order {job.orderNumber}</Text>
                        <View
                          style={[
                            styles.statusPill,
                            job.status === 'cancelled' && styles.statusPillCancelled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              job.status === 'cancelled' && styles.statusPillTextCancelled,
                            ]}
                          >
                            {getDeliveryJobStatusLabel(job.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.jobMeta}>
                        {job.pickupAddress} → {job.deliveryAddress}
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
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  jobsList: {
    gap: theme.spacing.sm,
  },
  jobCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.xs,
  },
  jobCardInactive: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    opacity: 0.8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  statusPillText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    textTransform: 'uppercase',
  },
  statusPillCancelled: {
    backgroundColor: theme.colors.errorContainer,
  },
  statusPillTextCancelled: {
    color: theme.colors.onErrorContainer,
  },
  jobMeta: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    lineHeight: theme.typography.lineHeight.bodySm,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.errorContainer,
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.error,
  },
  pressed: {
    opacity: 0.75,
  },
});
