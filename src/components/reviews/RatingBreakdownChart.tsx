import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RatingBreakdownRow } from '@constants/mockReviews';
import theme from '@theme/index';

interface RatingBreakdownChartProps {
  breakdown: RatingBreakdownRow[];
}

export default function RatingBreakdownChart({ breakdown }: RatingBreakdownChartProps) {
  return (
    <View style={styles.container}>
      {breakdown.map((row) => (
        <View key={row.stars} style={styles.row}>
          <Text style={styles.starLabel}>{row.stars}</Text>
          <MaterialIcons name="star" size={12} color={theme.colors.primary} />
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${row.percent}%` }]} />
          </View>
          <Text style={styles.percentLabel}>{row.percent}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  starLabel: {
    width: 12,
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  percentLabel: {
    width: 36,
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
  },
});
