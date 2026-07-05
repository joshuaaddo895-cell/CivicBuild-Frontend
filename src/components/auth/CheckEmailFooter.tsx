import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

export default function CheckEmailFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>© 2024 CivicBuild Industries. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.stackMd,
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.outlineVariant,
    textTransform: 'uppercase',
  },
});
