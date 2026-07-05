import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface CheckEmailMessageProps {
  email: string;
  subtitleBefore: string;
  subtitleAfter: string;
}

export default function CheckEmailMessage({
  email,
  subtitleBefore,
  subtitleAfter,
}: CheckEmailMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Check Your Email
      </Text>
      <Text style={styles.subtitle}>
        {subtitleBefore}
        <Text style={styles.email}>{email}</Text>
        {subtitleAfter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackSm,
    maxWidth: 320,
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
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  email: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
});
