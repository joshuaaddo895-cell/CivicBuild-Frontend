import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface VerificationStatusBadgeProps {
  label?: string;
}

export default function VerificationStatusBadge({
  label = 'Pending Verification',
}: VerificationStatusBadgeProps) {
  return (
    <View style={styles.badge} accessibilityRole="text">
      <MaterialIcons name="pending" size={14} color={theme.colors.onTertiaryFixed} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.tertiaryFixed,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  text: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onTertiaryFixed,
    textTransform: 'uppercase',
  },
});
