import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { VerificationDocument } from '@appTypes/verification';
import { MAX_UPLOAD_BYTES } from '@appTypes/verification';
import type { VerificationUploadConfig } from '@constants/verificationFieldsConfig';
import theme from '@theme/index';

interface VerificationUploadFieldProps {
  config: VerificationUploadConfig;
  document: VerificationDocument | null;
  onDocumentChange: (document: VerificationDocument | null) => void;
}

export default function VerificationUploadField({
  config,
  document,
  onDocumentChange,
}: VerificationUploadFieldProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePick = async () => {
    setErrorMessage('');
    setIsPicking(true);

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

      if (asset.size && asset.size > MAX_UPLOAD_BYTES) {
        setErrorMessage('File exceeds the 10MB limit. Please choose a smaller file.');
        return;
      }

      onDocumentChange({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
      });
    } catch {
      setErrorMessage('Unable to open file picker. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.sectionLabel}</Text>
      <Pressable
        onPress={handlePick}
        disabled={isPicking}
        style={({ pressed }) => [
          styles.dropzone,
          pressed && styles.dropzonePressed,
          document && styles.dropzoneFilled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Upload verification document"
        accessibilityHint={config.subtitle}
      >
        {isPicking ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <View style={styles.iconCircle}>
              <MaterialIcons name="cloud-upload" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{document ? document.name : config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
            <Text style={styles.example}>{config.example}</Text>
          </>
        )}
      </Pressable>
      {document ? (
        <Pressable
          onPress={() => onDocumentChange(null)}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel="Remove uploaded document"
        >
          <Text style={styles.removeText}>Remove file</Text>
        </Pressable>
      ) : null}
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
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
  removeButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
  },
  removeText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
});
