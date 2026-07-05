import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '@theme/index';

/** Soft decorative blur circles used on auth screens. */
export default function AuthDecorBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />
    </View>
  );
}

const styles = StyleSheet.create({
  topOrb: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: theme.colors.primaryContainer,
    opacity: 0.1,
  },
  bottomOrb: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: theme.colors.secondaryContainer,
    opacity: 0.2,
  },
});
