import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface ProfilePhotoPickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  isLoading?: boolean;
}

export default function ProfilePhotoPicker({
  imageUri,
  onImageSelected,
  isLoading = false,
}: ProfilePhotoPickerProps) {
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePickImage}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.photoButton,
          pressed && !isLoading && styles.photoButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Upload profile photo"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel="Profile photo preview"
          />
        ) : (
          <MaterialIcons name="add-a-photo" size={32} color={theme.colors.onSurfaceVariant} />
        )}
        <View style={styles.editBadge}>
          <MaterialIcons name="edit" size={14} color={theme.colors.onPrimary} />
        </View>
      </Pressable>
      <Text style={styles.hint}>Tap to upload a profile photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  photoButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: theme.colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoButtonPressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainerLowest,
  },
  hint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
