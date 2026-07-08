import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface ProfilePhotoConfirmModalProps {
  visible: boolean;
  previewUri: string | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ProfilePhotoConfirmModal({
  visible,
  previewUri,
  loading = false,
  onCancel,
  onConfirm,
}: ProfilePhotoConfirmModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Use this photo?</Text>
          <Text style={styles.subtitle}>Preview your new profile picture before saving.</Text>

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.preview}
              contentFit="cover"
              accessibilityLabel="Profile photo preview"
            />
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && !loading && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading || !previewUri}
              style={({ pressed }) => [
                styles.confirmButton,
                (loading || !previewUri) && styles.buttonDisabled,
                pressed && !loading && previewUri && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Confirm profile photo"
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.confirmLabel}>Confirm</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: theme.colors.outlineVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  cancelLabel: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  confirmLabel: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
