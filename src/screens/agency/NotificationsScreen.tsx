import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NotificationsScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import { ResendSuccessToast } from '@components/auth';
import { useAuthStore } from '@store/authStore';
import { useDeliveryPersonnelStore } from '@store/deliveryPersonnelStore';
import theme from '@theme/index';

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const seedIfNeeded = useDeliveryPersonnelStore((state) => state.seedIfNeeded);
  const pendingPersonnel = useDeliveryPersonnelStore((state) =>
    state.getPendingByAgencyId(agencyId),
  );
  const approvePersonnel = useDeliveryPersonnelStore((state) => state.approvePersonnel);
  const rejectPersonnel = useDeliveryPersonnelStore((state) => state.rejectPersonnel);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    seedIfNeeded();
  }, [seedIfNeeded]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleApprove = (personnelId: string, fullName: string) => {
    approvePersonnel(personnelId);
    showToast(`${fullName} approved — they can now access their dashboard`);
  };

  const handleReject = (personnelId: string, fullName: string) => {
    rejectPersonnel(personnelId);
    showToast(`${fullName}'s request was rejected`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Notifications" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Delivery provider association requests for your construction agency.
        </Text>

        {pendingPersonnel.length === 0 ? (
          <EmptyState
            icon="notifications-none"
            title="No pending requests"
            message="When delivery providers request to join your agency, their applications will appear here."
          />
        ) : (
          pendingPersonnel.map((person) => (
            <View key={person.id} style={styles.card}>
              {person.profileImageUri ? (
                <Image
                  source={{ uri: person.profileImageUri }}
                  style={styles.avatar}
                  contentFit="cover"
                  accessibilityLabel={`${person.fullName} profile photo`}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{person.fullName.charAt(0)}</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={styles.name}>{person.fullName}</Text>
                <Text style={styles.vehicle}>{person.vehicleInfo}</Text>
                <Text style={styles.requestLabel}>Delivery provider association request</Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleApprove(person.id, person.fullName)}
                    style={({ pressed }) => [styles.approveButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${person.fullName}`}
                  >
                    <Text style={styles.approveText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleReject(person.id, person.fullName)}
                    style={({ pressed }) => [styles.rejectButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`Reject ${person.fullName}`}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.toastContainer}>
        <ResendSuccessToast
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </View>
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
    gap: theme.spacing.sm,
  },
  intro: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    gap: 4,
  },
  name: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  vehicle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  requestLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.tertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  approveButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimary,
    textTransform: 'uppercase',
  },
  rejectButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.error,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.85,
  },
  toastContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
});
