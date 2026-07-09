import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPortfolioUploadErrorMessage, uploadAgencyPortfolioImage } from '@api/agencyPortfolio';
import type { AgencyPortfolioScreenProps } from '@appTypes/navigation';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { EmptyState, ScreenHeader } from '@components/agency';
import { ResendSuccessToast } from '@components/auth';
import { useAgencyPortfolioStore } from '@store/agencyPortfolioStore';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { validatePortfolioUpload } from '@utils/uploadValidation';

export default function AgencyPortfolioScreen({ navigation }: AgencyPortfolioScreenProps) {
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const allImages = useAgencyPortfolioStore((state) => state.imagesByAgencyId);
  const addPortfolioImage = useAgencyPortfolioStore((state) => state.addPortfolioImage);
  const portfolioImages = useMemo(() => allImages[agencyId] ?? [], [agencyId, allImages]);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

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

      addPortfolioImage(agencyId, {
        imageId: uploadResult.data.imageId,
        deliveryUrl: uploadResult.data.deliveryUrl,
      });
      setSuccessVisible(true);
    } catch {
      setErrorMessage('Unable to upload portfolio image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Agency Portfolio" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <MaterialIcons name="add-photo-alternate" size={22} color={theme.colors.onPrimary} />
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
              <Image
                key={image.imageId}
                source={{ uri: image.deliveryUrl }}
                style={styles.gridImage}
                contentFit="cover"
                accessibilityLabel="Portfolio image"
              />
            ))}
          </View>
        )}
      </ScrollView>

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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  gridImage: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  toastContainer: {
    position: 'absolute',
    bottom: theme.spacing.stackLg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
