import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import theme from '@theme/index';

interface BackToSignInLinkProps {
  onPress: () => void;
}

export default function BackToSignInLink({ onPress }: BackToSignInLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
      accessibilityRole="link"
      accessibilityLabel="Back to Sign In"
    >
      <MaterialIcons name="arrow-back" size={18} color={theme.colors.onSurfaceVariant} />
      <Text style={styles.text}>Back to Sign In</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.stackLg,
    paddingVertical: theme.spacing.sm,
  },
  linkPressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
});
