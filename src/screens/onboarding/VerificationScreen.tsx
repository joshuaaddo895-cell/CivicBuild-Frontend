import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { VerificationScreenProps } from '@appTypes/navigation';
import {
  createEmptyVerificationForm,
  getRequiredVerificationDocumentTypes,
  isVerificationFormValid,
  setVerificationDocument,
  updateVerificationField,
} from '@appTypes/verification';
import type { VerificationDocumentType } from '@appTypes/verificationDocuments';
import { AuthDecorBackground, AuthErrorBanner } from '@components/auth';
import {
  OnboardingProgressTracker,
  VerificationCategoryPicker,
  VerificationFormField,
  VerificationHeader,
  VerificationInfoChip,
  VerificationSubmitButton,
  VerificationUploadField,
} from '@components/onboarding';
import { getVerificationConfig } from '@constants/verificationFieldsConfig';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

export default function VerificationScreen({ navigation }: VerificationScreenProps) {
  const accountType = useAuthStore((state) => state.accountType);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const config = useMemo(() => getVerificationConfig(accountType), [accountType]);
  const requiredDocumentTypes = useMemo(
    () => getRequiredVerificationDocumentTypes('construction'),
    [],
  );

  const [formValues, setFormValues] = useState(createEmptyVerificationForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!config) {
      navigation.replace('RoleSelection');
    }
  }, [config, navigation]);

  const handleDocumentUploaded = useCallback(
    (document: { documentId: string; documentType: VerificationDocumentType }) => {
      setFormValues((current) => ({
        ...current,
        documents: setVerificationDocument(current.documents, document),
      }));
    },
    [],
  );

  const handleViewDocument = useCallback(
    (documentType: VerificationDocumentType) => {
      navigation.navigate('VerificationDocumentPreview', { documentType });
    },
    [navigation],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitError('');

    if (!isVerificationFormValid(formValues, requiredDocumentTypes)) {
      setSubmitError('Complete all fields and upload the required verification documents.');
      return;
    }

    setIsSubmitting(true);

    try {
      useAuthStore.getState().setVerificationStatus('pending');
      useAuthStore.getState().setManagedAgencyId('buildstrong-ltd');
      completeOnboarding();
    } catch {
      setSubmitError('Unable to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [completeOnboarding, formValues, requiredDocumentTypes]);

  if (!config) {
    return null;
  }

  const categoryField = config.fields.find((field) => field.id === 'category');

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <VerificationHeader />

          {submitError ? <AuthErrorBanner message={submitError} /> : null}

          <View style={styles.form}>
            <VerificationFormField
              label={config.fields[0]?.label ?? 'Business Name'}
              placeholder={config.fields[0]?.placeholder}
              value={formValues.businessName}
              onChangeText={(text) =>
                setFormValues((current) => updateVerificationField(current, 'businessName', text))
              }
            />

            {categoryField?.type === 'select' && categoryField.options ? (
              <VerificationCategoryPicker
                label={categoryField.label}
                placeholder={categoryField.placeholder}
                value={formValues.category}
                options={categoryField.options}
                onSelect={(value) =>
                  setFormValues((current) => updateVerificationField(current, 'category', value))
                }
              />
            ) : null}

            {config.uploads.map((uploadConfig) => (
              <VerificationUploadField
                key={uploadConfig.documentType}
                config={uploadConfig}
                uploadedDocument={formValues.documents[uploadConfig.documentType] ?? null}
                onDocumentUploaded={handleDocumentUploaded}
                onViewDocument={() => handleViewDocument(uploadConfig.documentType)}
              />
            ))}

            <VerificationInfoChip />

            <VerificationSubmitButton loading={isSubmitting} onPress={handleSubmit} />
          </View>

          <OnboardingProgressTracker />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackLg,
    paddingBottom: theme.spacing.stackLg,
  },
  inner: {
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
  },
  form: {
    gap: theme.spacing.stackMd,
  },
});
