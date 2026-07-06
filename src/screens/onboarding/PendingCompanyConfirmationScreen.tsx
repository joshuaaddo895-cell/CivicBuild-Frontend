import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PendingCompanyConfirmationScreenProps } from '@appTypes/navigation';
import { AuthDecorBackground } from '@components/auth';
import { findConstructionAgencyById } from '@constants/constructionAgencies';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

export default function PendingCompanyConfirmationScreen({
  navigation,
}: PendingCompanyConfirmationScreenProps) {
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const approveDeliveryProvider = useAuthStore((state) => state.approveDeliveryProvider);
  const logout = useAuthStore((state) => state.logout);

  const agency = findConstructionAgencyById(deliveryProviderProfile?.constructionAgencyId ?? null);

  const handleDemoApproval = () => {
    approveDeliveryProvider();
  };

  const handleBackToRoles = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="hourglass-top" size={40} color={theme.colors.tertiary} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            Pending Company Confirmation
          </Text>
          <Text style={styles.subtitle}>
            Your request to join{' '}
            <Text style={styles.agencyName}>{agency?.name ?? 'the selected company'}</Text> as a
            delivery provider is awaiting approval from their team.
          </Text>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              You will receive a notification once the construction agency confirms your
              association. Until then, marketplace access remains limited.
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('DeliveryProviderSetup')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit delivery provider profile"
          >
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </Pressable>

          <Pressable
            onPress={handleDemoApproval}
            style={({ pressed }) => [styles.demoButton, pressed && styles.demoButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Simulate company approval for demo"
          >
            <Text style={styles.demoButtonText}>Simulate Company Approval (Demo)</Text>
          </Pressable>

          <Pressable
            onPress={handleBackToRoles}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Sign out and return to sign in"
          >
            <Text style={styles.linkButtonText}>Sign Out</Text>
          </Pressable>
        </View>
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
    flexGrow: 1,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackLg,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    alignItems: 'center',
    gap: theme.spacing.stackMd,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  agencyName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  secondaryButtonPressed: {
    backgroundColor: theme.colors.primaryContainer,
  },
  secondaryButtonText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  demoButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  demoButtonPressed: {
    opacity: 0.85,
  },
  demoButtonText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  linkButton: {
    paddingVertical: theme.spacing.sm,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.error,
  },
});
