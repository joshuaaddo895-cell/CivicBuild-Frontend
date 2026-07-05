import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import theme from '@theme/index';

interface DashboardSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function DashboardSearchBar({ value, onChangeText }: DashboardSearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="search"
        size={22}
        color={theme.colors.onSurfaceVariant}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Search for cement, blocks, gravel..."
        placeholderTextColor={theme.colors.outline}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel="Search materials and suppliers"
        accessibilityRole="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurface,
    paddingVertical: 0,
  },
});
