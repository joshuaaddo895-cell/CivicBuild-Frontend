import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import theme from '@theme/index';

export default function CheckEmailIllustration() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY }] }]}
      accessibilityRole="image"
      accessibilityLabel="Email sent confirmation"
    >
      <View style={styles.circle}>
        <MaterialIcons name="mark-email-unread" size={64} color={theme.colors.primary} />
        <View style={styles.badge}>
          <MaterialIcons name="check" size={20} color={theme.colors.onPrimaryContainer} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.stackLg,
  },
  circle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${theme.colors.primaryContainer}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryContainer,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
});
