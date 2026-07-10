import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setupDeliveryProvider } from '@api/delivery';
import { completeOnboarding as completeOnboardingApi } from '@api/onboarding';
import { uploadAvatar } from '@api/users';
import type { DeliveryProviderSetupScreenProps } from '@appTypes/navigation';
import { setVerificationDocument, type VerificationDocumentsState } from '@appTypes/verification';
import type { LocalUploadFile, VerificationDocumentType } from '@appTypes/verificationDocuments';
import { AuthDecorBackground, AuthErrorBanner, AuthInput } from '@components/auth';
import { ConstructionAgencySelect, ProfilePhotoPicker } from '@components/delivery';
import {
  OnboardingContinueButton,
  OnboardingHeader,
  VerificationUploadField,
} from '@components/onboarding';
import { DELIVERY_VERIFICATION_UPLOADS } from '@constants/verificationFieldsConfig';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { isLocalImageUri } from '@utils/agencyPostMappers';
import { formatUserDisplayName } from '@utils/userDisplay';

export default function DeliveryProviderSetupScreen({
  navigation,
}: DeliveryProviderSetupScreenProps) {
  const user = useAuthStore((state) => state.user);
  const syncOnboardingFromServer = useAuthStore((state) => state.syncOnboardingFromServer);
  const applyServerOnboarding = useAuthStore((state) => state.applyServerOnboarding);

  const defaultFullName = useMemo(() => formatUserDisplayName(user), [user]);

  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState(defaultFullName);
  const [constructionAgencyId, setConstructionAgencyId] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [documents, setDocuments] = useState<VerificationDocumentsState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleDocumentUploaded = useCallback(
    (document: { documentId: string; documentType: VerificationDocumentType }) => {
      setDocuments((current) => setVerificationDocument(current, document));
    },
    [],
  );

  const handleViewDocument = useCallback(
    (documentType: VerificationDocumentType) => {
      navigation.navigate('VerificationDocumentPreview', { documentType });
    },
    [navigation],
  );

  const submitSetup = async (agencyId: string | null) => {
    let profileImageUrl: string | undefined;

    if (profileImageUri && isLocalImageUri(profileImageUri)) {
      const localFile: LocalUploadFile = {
        uri: profileImageUri,
        name: `avatar-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      };
      const uploadResult = await uploadAvatar(localFile);

      if (!uploadResult.ok) {
        throw new Error(uploadResult.error.message);
      }

      profileImageUrl = uploadResult.data.profilePictureUrl;
    } else if (profileImageUri) {
      profileImageUrl = profileImageUri;
    }

    const setupResult = await setupDeliveryProvider({
      fullName: fullName.trim() || defaultFullName,
      constructionAgencyId: agencyId,
      vehicleInfo: vehicleInfo.trim() || undefined,
      profileImageUrl,
    });

    if (!setupResult.ok) {
      throw new Error(setupResult.error.message);
    }

    await syncOnboardingFromServer();

    if (!agencyId) {
      const completeResult = await completeOnboardingApi();

      if (!completeResult.ok) {
        throw new Error(completeResult.error.message);
      }

      applyServerOnboarding(completeResult.data);
      return;
    }

    navigation.navigate('PendingCompanyConfirmation');
  };

  const handleContinue = async () => {
    setSubmitError('');

    if (!constructionAgencyId) {
      setSubmitError('Please select a construction company to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSetup(constructionAgencyId);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to complete setup. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await submitSetup(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to complete setup. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <OnboardingHeader
              title="Delivery Provider Setup"
              subtitle="Complete your profile and link to a construction company. Documents are optional — you can add them later."
            />

            {submitError ? <AuthErrorBanner message={submitError} /> : null}

            <View style={styles.form}>
              <ProfilePhotoPicker imageUri={profileImageUri} onImageSelected={setProfileImageUri} />

              <AuthInput
                label="Full Name"
                icon="person"
                placeholder="Your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <AuthInput
                label="Vehicle Information"
                placeholder="e.g. Toyota Hilux · Greater Accra · GH-1234-20"
                value={vehicleInfo}
                onChangeText={setVehicleInfo}
                autoCapitalize="sentences"
                autoCorrect={false}
              />

              <ConstructionAgencySelect
                selectedAgencyId={constructionAgencyId}
                onSelect={setConstructionAgencyId}
                isLoading={isSubmitting}
              />

              {DELIVERY_VERIFICATION_UPLOADS.map((uploadConfig) => (
                <VerificationUploadField
                  key={uploadConfig.documentType}
                  config={uploadConfig}
                  uploadedDocument={documents[uploadConfig.documentType] ?? null}
                  onDocumentUploaded={handleDocumentUploaded}
                  onViewDocument={() => handleViewDocument(uploadConfig.documentType)}
                />
              ))}

              <OnboardingContinueButton
                label="Continue"
                loading={isSubmitting}
                onPress={() => void handleContinue()}
              />

              <Pressable
                onPress={() => void handleSkip()}
                disabled={isSubmitting}
                style={styles.skipButton}
                accessibilityRole="button"
                accessibilityLabel="Skip for now"
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackLg,
  },
  inner: {
    width: '100%',
    maxWidth: 512,
    alignSelf: 'center',
    gap: theme.spacing.stackMd,
  },
  form: {
    gap: theme.spacing.stackMd,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.primary,
  },
});
