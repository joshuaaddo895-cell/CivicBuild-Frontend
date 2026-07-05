import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import theme from '@theme/index';

interface AuthBackButtonProps {
  onPress: () => void;
  label?: string;
}

export default function AuthBackButton({ onPress, label = 'Go back' }: AuthBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.stackMd,
    borderRadius: theme.borderRadius.full,
  },
  buttonPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
