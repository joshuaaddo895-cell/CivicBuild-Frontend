import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CivicBuildLogo } from '@components/auth';
import theme from '@theme/index';

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
}

export default function OnboardingHeader({ title, subtitle }: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <CivicBuildLogo size="md" />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: theme.spacing.stackLg,
    gap: theme.spacing.sm,
  },
  logoSection: {
    marginBottom: theme.spacing.stackSm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.headlineLgMobile,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
});
