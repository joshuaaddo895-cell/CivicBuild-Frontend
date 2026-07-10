import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAgency } from '@api/agencies';
import { completeOnboarding as completeOnboardingApi } from '@api/onboarding';
import type { VerificationScreenProps } from '@appTypes/navigation';
import {
  createEmptyVerificationForm,
  setVerificationDocument,
  updateVerificationField,
} from '@appTypes/verification';
import type { VerificationDocumentType } from '@appTypes/verificationDocuments';
import { AuthDecorBackground } from '@components/auth';
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

  const config = useMemo(() => getVerificationConfig(accountType), [accountType]);

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

  const finishOnboarding = useCallback(async () => {
    const hasUploadedDocuments = Object.keys(formValues.documents).length > 0;

    if (hasUploadedDocuments) {
      useAuthStore.getState().setVerificationStatus('pending');
    }

    if (accountType === 'construction' && formValues.businessName.trim()) {
      const agencyResult = await createAgency({
        name: formValues.businessName.trim(),
        category: formValues.category || 'general-contracting',
      });

      if (!agencyResult.ok) {
        throw new Error(agencyResult.error.message);
      }
    }

    const completeResult = await completeOnboardingApi();
    if (!completeResult.ok) {
      throw new Error(completeResult.error.message);
    }

    useAuthStore.getState().applyServerOnboarding(completeResult.data);
  }, [accountType, formValues.businessName, formValues.category, formValues.documents]);

  const handleContinue = useCallback(async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await finishOnboarding();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to complete setup.');
    } finally {
      setIsSubmitting(false);
    }
  }, [finishOnboarding]);

  const handleSkip = useCallback(async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await finishOnboarding();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to complete setup.');
    } finally {
      setIsSubmitting(false);
    }
  }, [finishOnboarding]);

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

            <VerificationSubmitButton
              loading={isSubmitting}
              label="Continue"
              onPress={handleContinue}
            />

            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

            <Pressable
              onPress={handleSkip}
              disabled={isSubmitting}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Skip for now"
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
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
  skipButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.primary,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
