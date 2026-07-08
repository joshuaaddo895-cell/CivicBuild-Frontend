import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

import CartIconButton from './CartIconButton';
import UserAvatarBadge from './UserAvatarBadge';

interface DashboardHeaderProps {
  cartItemCount?: number;
  userInitials: string;
  userAvatarUri?: string | null;
  onAvatarPress?: () => void;
  onCartPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
}

export default function DashboardHeader({
  cartItemCount = 0,
  userInitials,
  userAvatarUri,
  onAvatarPress,
  onCartPress,
  onNotificationsPress,
  onSettingsPress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <UserAvatarBadge initials={userInitials} imageUri={userAvatarUri} onPress={onAvatarPress} />
      <Text style={styles.brand}>CivicBuild</Text>
      <View style={styles.actions}>
        <CartIconButton itemCount={cartItemCount} onPress={onCartPress} />
        <Pressable
          onPress={onSettingsPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <MaterialIcons name="settings" size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={onNotificationsPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  brand: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.headlineMd,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
  iconButton: {
    padding: theme.spacing.xs,
    position: 'relative',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
});
