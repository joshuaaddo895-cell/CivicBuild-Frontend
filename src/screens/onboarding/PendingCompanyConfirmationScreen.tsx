import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency } from '@api/agencies';
import type { PendingCompanyConfirmationScreenProps } from '@appTypes/navigation';
import { AuthDecorBackground } from '@components/auth';
import DeleteAccountModal from '@components/settings/DeleteAccountModal';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { performDeleteAccount } from '@utils/session';

function confirmCancelRequest(onConfirm: () => void) {
  const title = 'Cancel association request?';
  const message =
    'This withdraws your pending delivery provider request. You can choose a different account type or submit a new request later.';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Keep Waiting', style: 'cancel' },
    {
      text: 'Cancel Request',
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
}

export default function PendingCompanyConfirmationScreen({
  navigation,
}: PendingCompanyConfirmationScreenProps) {
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const deliveryProviderStatus = useAuthStore((state) => state.deliveryProviderStatus);
  const syncDeliveryProviderApproval = useAuthStore((state) => state.syncDeliveryProviderApproval);
  const cancelDeliveryProviderRequest = useAuthStore(
    (state) => state.cancelDeliveryProviderRequest,
  );

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [agencyName, setAgencyName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      syncDeliveryProviderApproval();
      const agencyId = deliveryProviderProfile?.constructionAgencyId;
      if (agencyId) {
        void getAgency(agencyId).then((result) => {
          if (result.ok) {
            setAgencyName(result.data.name);
          }
        });
      }
    }, [deliveryProviderProfile?.constructionAgencyId, syncDeliveryProviderApproval]),
  );

  const isRejected = deliveryProviderStatus === 'rejected';

  const resetToRoleSelection = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    });
  };

  const handleCancelRequest = () => {
    confirmCancelRequest(() => {
      cancelDeliveryProviderRequest();
      resetToRoleSelection();
    });
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const result = await performDeleteAccount();

      if (!result.ok) {
        setDeleteError(result.message);
        if (result.sessionCleared) {
          setDeleteModalVisible(false);
        }
        return;
      }

      setDeleteModalVisible(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={[styles.iconCircle, isRejected && styles.iconCircleRejected]}>
            <MaterialIcons
              name={isRejected ? 'cancel' : 'hourglass-top'}
              size={40}
              color={isRejected ? theme.colors.error : theme.colors.tertiary}
            />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {isRejected ? 'Association Declined' : 'Waiting for Approval'}
          </Text>
          <Text style={styles.subtitle}>
            {isRejected ? (
              <>
                <Text style={styles.agencyName}>{agencyName ?? 'The selected company'}</Text>{' '}
                declined your delivery provider association. You can edit your profile and submit
                again.
              </>
            ) : (
              <>
                <Text style={styles.agencyName}>{agencyName ?? 'The selected company'}</Text> needs
                to approve your association before you can start receiving deliveries. We&apos;ll
                notify you once approved.
              </>
            )}
          </Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your submitted details</Text>

            {deliveryProviderProfile?.profileImageUri ? (
              <Image
                source={{ uri: deliveryProviderProfile.profileImageUri }}
                style={styles.profileImage}
                contentFit="cover"
                accessibilityLabel="Your profile photo"
              />
            ) : (
              <View style={styles.profileFallback}>
                <MaterialIcons name="person" size={32} color={theme.colors.onSurfaceVariant} />
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Full name</Text>
              <Text style={styles.summaryValue}>{deliveryProviderProfile?.fullName ?? '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Construction company</Text>
              <Text style={styles.summaryValue}>{agencyName ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {isRejected
                ? 'Update your profile and resubmit if you selected the wrong company or need to try again.'
                : 'This screen is a blocking gate — you will not reach the delivery dashboard until your agency approves your request via Notifications.'}
            </Text>
          </View>

          {!isRejected ? (
            <Pressable
              onPress={handleCancelRequest}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel association request"
            >
              <Text style={styles.secondaryButtonText}>Cancel Request</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('DeliveryProviderSetup')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit delivery provider profile"
          >
            <Text style={styles.secondaryButtonText}>
              {isRejected ? 'Edit & Resubmit' : 'Edit Profile'}
            </Text>
          </Pressable>

          {isRejected ? (
            <Pressable
              onPress={handleCancelRequest}
              style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Choose a different account type"
            >
              <Text style={styles.linkButtonText}>Choose Different Account Type</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => setDeleteModalVisible(true)}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={styles.linkButtonText}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={deleteModalVisible}
        loading={isDeletingAccount}
        errorMessage={deleteError}
        onCancel={() => {
          if (!isDeletingAccount) {
            setDeleteModalVisible(false);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDeleteAccountConfirm}
      />
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
  iconCircleRejected: {
    backgroundColor: theme.colors.errorContainer,
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
  summaryCard: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryTitle: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  profileFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    width: '100%',
    gap: 2,
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
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
