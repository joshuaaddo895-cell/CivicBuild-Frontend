import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

export default function VerificationInfoChip() {
  return (
    <View style={styles.container} accessibilityRole="text">
      <MaterialIcons name="info-outline" size={22} color={theme.colors.secondary} />
      <Text style={styles.text}>
        Verification typically takes 24–48 business hours. Verified businesses receive a green badge
        and priority in search results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: `${theme.colors.secondaryContainer}4D`,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
  },
  text: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSecondaryContainer,
  },
});
