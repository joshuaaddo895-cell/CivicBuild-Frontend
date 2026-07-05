import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

import VerificationStatusBadge from './VerificationStatusBadge';

interface VerificationHeaderProps {
  subtitle?: string;
}

export default function VerificationHeader({
  subtitle = 'Upload documents to get verified and build trust with customers.',
}: VerificationHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          Verify Your Business
        </Text>
        <VerificationStatusBadge />
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.stackMd,
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.headlineLgMobile,
    minWidth: 180,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
});
