import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProfileScreenProps } from '@appTypes/navigation';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { formatUserDisplayName } from '@utils/mockAuth';
import { confirmSignOut, performSignOut } from '@utils/session';

function formatAccountTypeLabel(accountType: string | null): string {
  if (!accountType) {
    return 'USER';
  }

  return accountType.replace(/-/g, ' ').toUpperCase();
}

export default function ProfileScreen(_props: ProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const accountType = useAuthStore((state) => state.accountType);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const displayName = formatUserDisplayName(user);
  const avatarInitial = displayName[0]?.toUpperCase() ?? '?';

  const menuItems = [
    { emoji: '⚙️', label: 'Settings', onPress: () => {} },
    { emoji: '🔔', label: 'Notifications', onPress: () => {} },
    { emoji: '🔒', label: 'Privacy & Security', onPress: () => {} },
    { emoji: '❓', label: 'Help & Support', onPress: () => {} },
    { emoji: '📄', label: 'Terms of Service', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Profile
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{formatAccountTypeLabel(accountType)}</Text>
          </View>
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
              <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Text style={styles.menuItemChevron}>›</Text>
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
          accessibilityLabel="Sign out"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        >
          {isSigningOut ? (
            <ActivityIndicator color={theme.colors.error} />
          ) : (
            <Text style={styles.logoutText}>Sign Out</Text>
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
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLg,
    lineHeight: theme.typography.lineHeight.headlineLg,
  },
  name: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.md,
  },
  roleBadge: {
    backgroundColor: `${theme.colors.primaryContainer}33`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
  },
  roleText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
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
  menuItemEmoji: {
    fontSize: 20,
  },
  menuItemLabel: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
  },
  menuItemChevron: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyLg,
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
