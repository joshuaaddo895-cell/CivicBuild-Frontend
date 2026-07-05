import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface CivicBuildLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  layout?: 'stack' | 'inline';
}

const MARK_SIZES = { sm: 40, md: 48, lg: 56 } as const;

export default function CivicBuildLogo({
  size = 'md',
  showWordmark = true,
  layout = 'stack',
}: CivicBuildLogoProps) {
  const markSize = MARK_SIZES[size];

  return (
    <View
      style={[styles.container, layout === 'inline' && styles.containerInline]}
      accessibilityRole="image"
      accessibilityLabel="CivicBuild logo"
    >
      <View
        style={[styles.mark, { width: markSize, height: markSize, borderRadius: markSize * 0.2 }]}
      >
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, size === 'sm' && styles.wordmarkSm]}>CivicBuild</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  containerInline: {
    flexDirection: 'row',
    gap: 0,
  },
  mark: {
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  crossVertical: {
    position: 'absolute',
    width: 4,
    height: '45%',
    backgroundColor: theme.colors.onPrimary,
    borderRadius: 2,
  },
  crossHorizontal: {
    position: 'absolute',
    width: '45%',
    height: 4,
    backgroundColor: theme.colors.onPrimary,
    borderRadius: 2,
  },
  wordmark: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.headlineMd,
  },
  wordmarkSm: {
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
  },
});
