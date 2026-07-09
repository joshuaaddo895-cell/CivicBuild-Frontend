import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface ProductImagePickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  isLoading?: boolean;
}

export default function ProductImagePicker({
  imageUri,
  onImageSelected,
  isLoading = false,
}: ProductImagePickerProps) {
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
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
        style={({ pressed }) => [styles.photoButton, pressed && !isLoading && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Upload product image"
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel="Product image preview"
          />
        ) : (
          <MaterialIcons name="add-a-photo" size={32} color={theme.colors.onSurfaceVariant} />
        )}
      </Pressable>
      <Text style={styles.hint}>Tap to upload a product image</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  photoButton: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: theme.colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
});
