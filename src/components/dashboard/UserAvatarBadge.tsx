import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface UserAvatarBadgeProps {
  initials: string;
  imageUri?: string | null;
  onPress?: () => void;
  size?: number;
}

export default function UserAvatarBadge({
  initials,
  imageUri,
  onPress,
  size = 36,
}: UserAvatarBadgeProps) {
  const radius = size / 2;

  const content = imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={{ width: size, height: size, borderRadius: radius }}
      contentFit="cover"
      accessibilityLabel="Profile photo"
    />
  ) : (
    <View style={[styles.initialsCircle, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  initialsCircle: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: theme.typography.fontFamily.headline,
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
