import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface VerificationHeaderProps {
  subtitle?: string;
}

export default function VerificationHeader({
  subtitle = 'Upload documents to build trust with customers. You can skip this for now and add them later.',
}: VerificationHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Agency Verification
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.stackMd,
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.headlineLgMobile,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
});
