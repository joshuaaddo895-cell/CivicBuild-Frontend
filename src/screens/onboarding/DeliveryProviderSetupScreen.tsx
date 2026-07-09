import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DeliveryProviderSetupScreenProps } from '@appTypes/navigation';
import {
  areRequiredVerificationDocumentsUploaded,
  setVerificationDocument,
  type VerificationDocumentsState,
} from '@appTypes/verification';
import type { VerificationDocumentType } from '@appTypes/verificationDocuments';
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
import { formatUserDisplayName } from '@utils/mockAuth';

export default function DeliveryProviderSetupScreen({
  navigation,
}: DeliveryProviderSetupScreenProps) {
  const user = useAuthStore((state) => state.user);
  const submitDeliveryProviderSetup = useAuthStore((state) => state.submitDeliveryProviderSetup);

  const defaultFullName = useMemo(() => formatUserDisplayName(user), [user]);
  const requiredDocumentTypes = useMemo<VerificationDocumentType[]>(
    () => ['GOVERNMENT_ID', 'PROFESSIONAL_LICENSE'],
    [],
  );

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

  const handleSubmit = async () => {
    setSubmitError('');

    if (!constructionAgencyId) {
      setSubmitError('Please select a construction company to continue.');
      return;
    }

    if (!vehicleInfo.trim()) {
      setSubmitError('Please enter your vehicle information.');
      return;
    }

    if (!areRequiredVerificationDocumentsUploaded(documents, requiredDocumentTypes)) {
      setSubmitError('Upload your government ID and license documents before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      submitDeliveryProviderSetup({
        profileImageUri,
        fullName: fullName.trim() || defaultFullName,
        constructionAgencyId,
        vehicleInfo: vehicleInfo.trim(),
      });
      navigation.navigate('PendingCompanyConfirmation');
    } catch {
      setSubmitError('Unable to submit your profile. Please try again.');
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
              subtitle="Complete your profile, upload verification documents, and link to a construction company."
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
                label="Submit for Company Review"
                loading={isSubmitting}
                onPress={handleSubmit}
              />
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
});
