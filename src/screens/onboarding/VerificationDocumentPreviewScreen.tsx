import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { getVerificationDocumentUrl, getVerificationViewErrorMessage } from '@api/verification';
import type { VerificationDocumentPreviewScreenProps } from '@appTypes/navigation';
import { ScreenHeader } from '@components/agency';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { isPdfSignedUrl } from '@utils/uploadValidation';

export default function VerificationDocumentPreviewScreen({
  navigation,
  route,
}: VerificationDocumentPreviewScreenProps) {
  const { documentType } = route.params;
  const userId = useAuthStore((state) => state.user?.id);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmptyState, setIsEmptyState] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDocumentUrl() {
      if (!userId) {
        if (isMounted) {
          setErrorMessage('You must be signed in to view this document.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');
      setIsEmptyState(false);
      setSignedUrl(null);

      const result = await getVerificationDocumentUrl(userId, documentType);
      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        if (result.error.statusCode === 404) {
          setIsEmptyState(true);
        } else {
          setErrorMessage(getVerificationViewErrorMessage(result.error));
        }
        setIsLoading(false);
        return;
      }

      setSignedUrl(result.data.signedUrl);
      setIsLoading(false);
    }

    void loadDocumentUrl();

    return () => {
      isMounted = false;
    };
  }, [documentType, userId]);

  const showPdf = signedUrl ? isPdfSignedUrl(signedUrl) : false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Verification Document" onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>Loading document…</Text>
        </View>
      ) : isEmptyState ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No document uploaded yet</Text>
          <Text style={styles.statusText}>
            Upload this document from the verification form first.
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : signedUrl && showPdf ? (
        <WebView
          source={{ uri: signedUrl }}
          style={styles.preview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
        />
      ) : signedUrl ? (
        <Image
          source={{ uri: signedUrl }}
          style={styles.imagePreview}
          contentFit="contain"
          accessibilityLabel="Verification document preview"
        />
      ) : null}
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
    paddingHorizontal: theme.spacing.marginMobile,
    gap: theme.spacing.sm,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.error,
    textAlign: 'center',
  },
  preview: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  imagePreview: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
});
