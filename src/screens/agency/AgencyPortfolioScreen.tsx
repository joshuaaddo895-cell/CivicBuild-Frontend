import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deletePortfolioImage, getMyPortfolio, type BackendPortfolioImage } from '@api/agencies';
import { getPortfolioUploadErrorMessage, uploadAgencyPortfolioImage } from '@api/agencyPortfolio';
import type { AgencyPortfolioScreenProps } from '@appTypes/navigation';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { EmptyState, ScreenHeader } from '@components/agency';
import { ResendSuccessToast } from '@components/auth';
import theme from '@theme/index';
import { validatePortfolioUpload } from '@utils/uploadValidation';

export default function AgencyPortfolioScreen({ navigation }: AgencyPortfolioScreenProps) {
  const [portfolioImages, setPortfolioImages] = useState<BackendPortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    const result = await getMyPortfolio();
    if (!result.ok) {
      setLoadError(result.error.message);
      setIsLoading(false);
      return;
    }

    setPortfolioImages(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const handleAddImage = async () => {
    setErrorMessage('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Photo library permission is required to upload portfolio images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const localFile: LocalUploadFile = {
      uri: asset.uri,
      name: asset.fileName ?? `portfolio-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? undefined,
    };

    const validationError = validatePortfolioUpload(localFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const uploadResult = await uploadAgencyPortfolioImage(localFile);
      if (!uploadResult.ok) {
        setErrorMessage(getPortfolioUploadErrorMessage(uploadResult.error));
        return;
      }

      await loadPortfolio();
      setSuccessVisible(true);
    } catch {
      setErrorMessage('Unable to upload portfolio image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    Alert.alert('Delete image', 'Remove this portfolio image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeletingImageId(imageId);
            const result = await deletePortfolioImage(imageId);
            setDeletingImageId(null);

            if (!result.ok) {
              Alert.alert('Delete failed', result.error.message);
              return;
            }

            setPortfolioImages((current) => current.filter((image) => image.imageId !== imageId));
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Agency Portfolio" onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{loadError}</Text>
          <Pressable
            onPress={() => void loadPortfolio()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading portfolio"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Showcase completed projects with JPG or PNG images up to 5MB each.
          </Text>

          <Pressable
            onPress={handleAddImage}
            disabled={isUploading}
            style={({ pressed }) => [
              styles.addButton,
              pressed && !isUploading && styles.addButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add portfolio item"
          >
            {isUploading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={22}
                  color={theme.colors.onPrimary}
                />
                <Text style={styles.addButtonText}>Add Portfolio Item</Text>
              </>
            )}
          </Pressable>

          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          {portfolioImages.length === 0 ? (
            <EmptyState
              icon="photo-library"
              title="No portfolio images yet"
              message="Upload project photos to help customers see your work."
            />
          ) : (
            <View style={styles.grid}>
              {portfolioImages.map((image) => (
                <View key={image.imageId} style={styles.gridItem}>
                  <Image
                    source={{ uri: image.deliveryUrl }}
                    style={styles.gridImage}
                    contentFit="cover"
                    accessibilityLabel="Portfolio image"
                  />
                  <Pressable
                    onPress={() => handleDeleteImage(image.imageId)}
                    disabled={deletingImageId === image.imageId}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Delete portfolio image"
                  >
                    {deletingImageId === image.imageId ? (
                      <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                    ) : (
                      <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color={theme.colors.onPrimary}
                      />
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.toastContainer}>
        <ResendSuccessToast
          message="Portfolio image uploaded successfully."
          visible={successVisible}
          onHide={() => setSuccessVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onPrimary,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  gridItem: {
    width: '48%',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: theme.spacing.stackLg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
