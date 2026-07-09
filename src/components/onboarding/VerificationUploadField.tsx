import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getVerificationUploadErrorMessage, uploadVerificationDocument } from '@api/verification';
import type {
  LocalUploadFile,
  UploadedVerificationDocument,
} from '@appTypes/verificationDocuments';
import { ResendSuccessToast } from '@components/auth';
import type { VerificationUploadFieldConfig } from '@constants/verificationFieldsConfig';
import theme from '@theme/index';
import { validateVerificationUpload } from '@utils/uploadValidation';

interface VerificationUploadFieldProps {
  config: VerificationUploadFieldConfig;
  uploadedDocument: UploadedVerificationDocument | null;
  onDocumentUploaded: (document: UploadedVerificationDocument) => void;
  onViewDocument: () => void;
}

export default function VerificationUploadField({
  config,
  uploadedDocument,
  onDocumentUploaded,
  onViewDocument,
}: VerificationUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  const hasDocument = Boolean(uploadedDocument?.documentId);
  const actionLabel = hasDocument ? 'Replace document' : config.title;

  const handlePick = async () => {
    setErrorMessage('');
    setIsUploading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const localFile: LocalUploadFile = {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
      };

      const validationError = validateVerificationUpload(localFile);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      const uploadResult = await uploadVerificationDocument(config.documentType, localFile);
      if (!uploadResult.ok) {
        setErrorMessage(getVerificationUploadErrorMessage(uploadResult.error));
        return;
      }

      onDocumentUploaded({
        documentId: uploadResult.data.documentId,
        documentType: uploadResult.data.documentType,
      });

      setSuccessMessage(
        hasDocument ? 'Document replaced successfully.' : 'Document uploaded successfully.',
      );
      setSuccessVisible(true);
    } catch {
      setErrorMessage('Unable to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.sectionLabel}</Text>
      <Pressable
        onPress={handlePick}
        disabled={isUploading}
        style={({ pressed }) => [
          styles.dropzone,
          pressed && !isUploading && styles.dropzonePressed,
          hasDocument && styles.dropzoneFilled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityHint={config.subtitle}
      >
        {isUploading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name={hasDocument ? 'check-circle' : 'cloud-upload'}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>{actionLabel}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
            <Text style={styles.example}>{config.example}</Text>
            {hasDocument ? (
              <Text style={styles.uploadedHint}>
                Document on file — upload again to replace the previous version.
              </Text>
            ) : null}
          </>
        )}
      </Pressable>

      {hasDocument ? (
        <Pressable
          onPress={onViewDocument}
          style={styles.viewButton}
          accessibilityRole="button"
          accessibilityLabel={`View ${config.sectionLabel}`}
        >
          <Text style={styles.viewText}>View uploaded document</Text>
        </Pressable>
      ) : null}

      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <ResendSuccessToast
        message={successMessage}
        visible={successVisible}
        onHide={() => setSuccessVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: theme.spacing.stackLg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dropzonePressed: {
    backgroundColor: `${theme.colors.primaryContainer}1A`,
    transform: [{ scale: 0.99 }],
  },
  dropzoneFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryFixedDim}0D`,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primaryContainer}33`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  example: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  uploadedHint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  viewButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
  },
  viewText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.primary,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
});
