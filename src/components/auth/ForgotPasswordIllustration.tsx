import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '@theme/index';

/** Padlock illustration below the forgot-password form (PROMPT.md). */
export default function ForgotPasswordIllustration() {
  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel="Secure password reset"
    >
      <View style={styles.circle}>
        <MaterialIcons
          name="lock-outline"
          size={56}
          color={theme.colors.primary}
          style={styles.icon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: theme.spacing.stackLg,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primaryContainer}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    opacity: 0.9,
  },
});
