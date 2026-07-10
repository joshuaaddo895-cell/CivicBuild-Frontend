import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency } from '@api/agencies';
import { getMyReviews, getMyReviewsSummary } from '@api/reviews';
import type { ProfileScreenProps } from '@appTypes/navigation';
import UserAvatarBadge from '@components/dashboard/UserAvatarBadge';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import {
  getAccountTypeLabel,
  getVerificationStatusColor,
  getVerificationStatusLabel,
} from '@utils/roleLabels';
import { confirmSignOut, performSignOut } from '@utils/session';
import { formatUserDisplayName } from '@utils/userDisplay';
import { getUserInitials } from '@utils/userInitials';

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const accountType = useAuthStore((state) => state.accountType);
  const verificationStatus = useAuthStore((state) => state.verificationStatus);
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [reviewsSummary, setReviewsSummary] = useState({ totalCount: 0, averageRatingGiven: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [associatedAgency, setAssociatedAgency] = useState<{
    name: string;
    logoUri: string;
  } | null>(null);

  const displayName = deliveryProviderProfile?.fullName?.trim() || formatUserDisplayName(user);
  const profileImageUri = user?.avatar ?? deliveryProviderProfile?.profileImageUri ?? null;
  const userInitials = getUserInitials(user, displayName);

  useEffect(() => {
    void (async () => {
      setIsLoadingReviews(true);

      const reviewsResult = await getMyReviews();

      if (reviewsResult.ok) {
        setReviewsSummary(getMyReviewsSummary(reviewsResult.data));
      } else {
        setReviewsSummary({ totalCount: 0, averageRatingGiven: 0 });
      }

      setIsLoadingReviews(false);
    })();
  }, []);

  useEffect(() => {
    const agencyId = deliveryProviderProfile?.constructionAgencyId;

    if (!agencyId) {
      setAssociatedAgency(null);
      return;
    }

    void (async () => {
      const result = await getAgency(agencyId);

      if (result.ok) {
        setAssociatedAgency({
          name: result.data.name,
          logoUri: result.data.logoUrl ?? '',
        });
      } else {
        setAssociatedAgency(null);
      }
    })();
  }, [deliveryProviderProfile?.constructionAgencyId]);

  const menuItems = [
    {
      icon: 'edit' as const,
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'receipt-long' as const,
      label: 'Order History',
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      icon: 'star-outline' as const,
      label: 'My Reviews / Ratings',
      subtitle: isLoadingReviews
        ? 'Loading...'
        : `${reviewsSummary.totalCount} reviews · ${reviewsSummary.averageRatingGiven.toFixed(1)} avg`,
      onPress: () => navigation.navigate('MyReviews'),
    },
    {
      icon: 'help-outline' as const,
      label: 'Help & Support',
      onPress: () => navigation.navigate('HelpSupport'),
    },
  ];

  const handleLogout = () => {
    confirmSignOut(async () => {
      setIsSigningOut(true);
      try {
        await performSignOut();
      } finally {
        setIsSigningOut(false);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Profile
        </Text>

        <View style={styles.profileCard}>
          <UserAvatarBadge initials={userInitials} imageUri={profileImageUri} size={88} />

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getAccountTypeLabel(accountType)}</Text>
          </View>

          {accountType === 'construction' && verificationStatus === 'verified' ? (
            <View
              style={[
                styles.statusBadge,
                { borderColor: getVerificationStatusColor(verificationStatus) },
              ]}
            >
              <MaterialIcons
                name="verified"
                size={16}
                color={getVerificationStatusColor(verificationStatus)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getVerificationStatusColor(verificationStatus) },
                ]}
              >
                {getVerificationStatusLabel(verificationStatus)}
              </Text>
            </View>
          ) : null}

          {accountType === 'delivery' && associatedAgency ? (
            <View style={styles.companyCard}>
              {associatedAgency.logoUri ? (
                <Image
                  source={{ uri: associatedAgency.logoUri }}
                  style={styles.companyLogo}
                  contentFit="cover"
                  accessibilityLabel={`${associatedAgency.name} logo`}
                />
              ) : (
                <View style={[styles.companyLogo, styles.companyLogoPlaceholder]}>
                  <MaterialIcons name="business" size={20} color={theme.colors.onSurfaceVariant} />
                </View>
              )}
              <View style={styles.companyInfo}>
                <Text style={styles.companyLabel}>Associated Company</Text>
                <Text style={styles.companyName}>{associatedAgency.name}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
                pressed && styles.menuItemPressed,
              ]}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <MaterialIcons name={item.icon} size={22} color={theme.colors.onSurfaceVariant} />
              <View style={styles.menuItemTextBlock}>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                {'subtitle' in item && item.subtitle ? (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && !isSigningOut && styles.logoutButtonPressed,
            isSigningOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isSigningOut}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        >
          {isSigningOut ? (
            <ActivityIndicator color={theme.colors.error} />
          ) : (
            <Text style={styles.logoutText}>Log Out</Text>
          )}
        </Pressable>
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
  screenTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.stackMd,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    ...theme.shadows.sm,
    gap: theme.spacing.sm,
  },
  name: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  email: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  roleBadge: {
    backgroundColor: `${theme.colors.primaryContainer}33`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
    marginTop: theme.spacing.xs,
  },
  roleText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    textTransform: 'uppercase',
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
  },
  companyLogoPlaceholder: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
    gap: 2,
  },
  companyLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  companyName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  menu: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  menuItemTextBlock: {
    flex: 1,
    gap: 2,
  },
  menuItemLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
  },
  menuItemSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  logoutButton: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
  },
  logoutButtonPressed: {
    backgroundColor: theme.colors.errorContainer,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.error,
    fontWeight: '600',
  },
});
