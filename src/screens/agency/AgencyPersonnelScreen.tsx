import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyPersonnelScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import { useAuthStore } from '@store/authStore';
import { useDeliveryPersonnelStore } from '@store/deliveryPersonnelStore';
import theme from '@theme/index';

export default function AgencyPersonnelScreen({ navigation }: AgencyPersonnelScreenProps) {
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const seedIfNeeded = useDeliveryPersonnelStore((state) => state.seedIfNeeded);
  const approvedPersonnel = useDeliveryPersonnelStore((state) =>
    state.getApprovedByAgencyId(agencyId),
  );
  const pendingPersonnel = useDeliveryPersonnelStore((state) =>
    state.getPendingByAgencyId(agencyId),
  );

  useEffect(() => {
    seedIfNeeded();
  }, [seedIfNeeded]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="My Delivery Personnel" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pendingPersonnel.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Approval</Text>
            <Text style={styles.sectionHint}>
              Review requests in Notifications to approve or reject applicants.
            </Text>
            {pendingPersonnel.map((person) => (
              <View key={person.id} style={styles.card}>
                <PersonnelAvatar uri={person.profileImageUri} name={person.fullName} />
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{person.fullName}</Text>
                  <Text style={styles.meta}>{person.vehicleInfo}</Text>
                  <Text style={styles.pendingBadge}>Awaiting approval</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approved Personnel</Text>
          {approvedPersonnel.length === 0 ? (
            <EmptyState
              icon="local-shipping"
              title="No approved personnel yet"
              message="Approved delivery providers will appear here once you confirm their association requests."
            />
          ) : (
            approvedPersonnel.map((person) => (
              <View key={person.id} style={styles.card}>
                <PersonnelAvatar uri={person.profileImageUri} name={person.fullName} />
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{person.fullName}</Text>
                  <Text style={styles.meta}>{person.vehicleInfo}</Text>
                  <Text style={styles.approvedBadge}>Approved</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    gap: theme.spacing.stackMd,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  sectionHint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
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
  pendingBadge: {
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.tertiary,
    textTransform: 'uppercase',
  },
  approvedBadge: {
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
});
