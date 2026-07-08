import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import ProfilePhotoConfirmModal from '@components/profile/ProfilePhotoConfirmModal';
import theme from '@theme/index';

interface ProfileAvatarEditorProps {
  initials: string;
  imageUri?: string | null;
  size?: number;
  saving?: boolean;
  onConfirmPhoto: (uri: string) => Promise<void>;
}

async function requestLibraryPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

async function requestCameraPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  return permission.granted;
}

export default function ProfileAvatarEditor({
  initials,
  imageUri,
  size = 88,
  saving = false,
  onConfirmPhoto,
}: ProfileAvatarEditorProps) {
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const radius = size / 2;
  const badgeSize = Math.max(28, Math.round(size * 0.32));

  const openPicker = async (source: 'library' | 'camera') => {
    const granted =
      source === 'camera' ? await requestCameraPermission() : await requestLibraryPermission();

    if (!granted) {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Allow camera access to take a profile photo.'
          : 'Allow photo library access to choose a profile photo.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (!result.canceled && result.assets[0]?.uri) {
      setPendingUri(result.assets[0].uri);
      setConfirmVisible(true);
    }
  };

  const handleAvatarPress = () => {
    if (saving) {
      return;
    }

    if (Platform.OS === 'ios') {
      Alert.alert('Profile photo', 'Choose a source', [
        { text: 'Photo Library', onPress: () => void openPicker('library') },
        { text: 'Camera', onPress: () => void openPicker('camera') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    Alert.alert('Profile photo', 'Choose a source', [
      { text: 'Photo Library', onPress: () => void openPicker('library') },
      { text: 'Camera', onPress: () => void openPicker('camera') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCancelPreview = () => {
    if (saving) {
      return;
    }
    setConfirmVisible(false);
    setPendingUri(null);
  };

  const handleConfirmPreview = async () => {
    if (!pendingUri) {
      return;
    }

    try {
      await onConfirmPhoto(pendingUri);
      setConfirmVisible(false);
      setPendingUri(null);
    } catch {
      // Parent handles error display.
    }
  };

  const displayUri = imageUri;

  return (
    <>
      <Pressable
        onPress={handleAvatarPress}
        disabled={saving}
        style={({ pressed }) => [pressed && !saving && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Edit profile photo"
        accessibilityState={{ disabled: saving, busy: saving }}
      >
        <View style={[styles.avatar, { width: size, height: size, borderRadius: radius }]}>
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              style={{ width: size, height: size, borderRadius: radius }}
              contentFit="cover"
              accessibilityLabel="Profile photo"
            />
          ) : (
            <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
          )}
          <View
            style={[
              styles.editBadge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
              },
            ]}
          >
            <MaterialIcons
              name="photo-camera"
              size={Math.round(badgeSize * 0.5)}
              color={theme.colors.onPrimary}
            />
          </View>
        </View>
      </Pressable>

      <ProfilePhotoConfirmModal
        visible={confirmVisible}
        previewUri={pendingUri}
        loading={saving}
        onCancel={handleCancelPreview}
        onConfirm={() => void handleConfirmPreview()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  initials: {
    fontFamily: theme.typography.fontFamily.headline,
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  pressed: {
    opacity: 0.9,
  },
});
