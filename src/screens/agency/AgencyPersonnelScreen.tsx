import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  approvePersonnel,
  getAgencyPersonnel,
  rejectPersonnel,
  type BackendPersonnel,
} from '@api/agencies';
import type { AgencyPersonnelScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import theme from '@theme/index';

export default function AgencyPersonnelScreen({ navigation }: AgencyPersonnelScreenProps) {
  const [personnel, setPersonnel] = useState<BackendPersonnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadPersonnel = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getAgencyPersonnel();

    if (result.ok) {
      setPersonnel(
        [...result.data].sort(
          (left, right) =>
            new Date(right.handledAt ?? right.submittedAt).getTime() -
            new Date(left.handledAt ?? left.submittedAt).getTime(),
        ),
      );
    } else {
      setPersonnel([]);
      setError(result.error.message);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadPersonnel();
  }, [loadPersonnel]);

  const handleApprove = async (personnelId: string) => {
    setActionId(personnelId);

    const result = await approvePersonnel(personnelId);

    if (result.ok) {
      setPersonnel((current) =>
        current.map((entry) => (entry.id === personnelId ? result.data : entry)),
      );
    } else {
      setError(result.error.message);
    }

    setActionId(null);
  };

  const handleReject = async (personnelId: string) => {
    setActionId(personnelId);

    const result = await rejectPersonnel(personnelId);

    if (result.ok) {
      setPersonnel((current) =>
        current.map((entry) => (entry.id === personnelId ? result.data : entry)),
      );
    } else {
      setError(result.error.message);
    }

    setActionId(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="My Delivery Personnel" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error && personnel.length === 0 ? (
          <EmptyState icon="error-outline" title="Could not load personnel" message={error} />
        ) : personnel.length === 0 ? (
          <EmptyState
            icon="local-shipping"
            title="No delivery personnel yet"
            message="Delivery providers who link to your agency during setup will appear here."
          />
        ) : (
          personnel.map((person) => (
            <View key={person.id} style={styles.card}>
              <PersonnelAvatar uri={person.profileImageUrl ?? null} name={person.fullName} />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{person.fullName}</Text>
                {person.vehicleInfo ? <Text style={styles.meta}>{person.vehicleInfo}</Text> : null}
                <Text style={styles.status}>{formatApprovalStatus(person.approvalStatus)}</Text>
              </View>
              {person.approvalStatus === 'pending' ? (
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => void handleApprove(person.id)}
                    disabled={actionId === person.id}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.approveButton,
                      pressed && styles.actionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${person.fullName}`}
                  >
                    {actionId === person.id ? (
                      <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                    ) : (
                      <Text style={styles.approveText}>Approve</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => void handleReject(person.id)}
                    disabled={actionId === person.id}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.rejectButton,
                      pressed && styles.actionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Reject ${person.fullName}`}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatApprovalStatus(status: BackendPersonnel['approvalStatus']): string {
  switch (status) {
    case 'pending':
      return 'Pending approval';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

function PersonnelAvatar({ uri, name }: { uri: string | null; name: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={styles.avatar}
        contentFit="cover"
        accessibilityLabel={`${name} profile photo`}
      />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
    </View>
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
    gap: theme.spacing.sm,
  },
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onPrimaryContainer,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  meta: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  status: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  actions: {
    gap: theme.spacing.xs,
  },
  actionButton: {
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
  actionPressed: {
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
});
