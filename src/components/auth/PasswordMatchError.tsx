import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

/** PROMPT.md copy for password confirmation mismatch. */
export default function PasswordMatchError() {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <MaterialIcons name="error-outline" size={14} color={theme.colors.error} />
      <Text style={styles.text}>ERROR: Password do not match</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.xs,
  },
  text: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: 11,
    color: theme.colors.error,
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
});
