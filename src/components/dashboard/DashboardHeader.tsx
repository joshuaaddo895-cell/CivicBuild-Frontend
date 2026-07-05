import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MARKETPLACE_LOCATION } from '@constants/marketplaceData';
import theme from '@theme/index';

interface DashboardHeaderProps {
  onNotificationsPress?: () => void;
}

export default function DashboardHeader({ onNotificationsPress }: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
        <Text style={styles.location}>{MARKETPLACE_LOCATION}</Text>
      </View>
      <Text style={styles.brand}>CivicBuild</Text>
      <Pressable
        onPress={onNotificationsPress}
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <MaterialIcons name="notifications-none" size={24} color={theme.colors.onSurfaceVariant} />
        <View style={styles.notificationDot} />
      </Pressable>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  location: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  brand: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.headlineMd,
  },
  notificationButton: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: theme.spacing.xs,
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
