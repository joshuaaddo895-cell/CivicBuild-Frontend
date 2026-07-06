import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { VerificationScreenProps } from '@appTypes/navigation';
import { createEmptyVerificationForm, updateVerificationField } from '@appTypes/verification';
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

  const [formValues, setFormValues] = useState(createEmptyVerificationForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!config) {
      navigation.replace('RoleSelection');
    }
  }, [config, navigation]);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      useAuthStore.getState().setVerificationStatus('pending');
      completeOnboarding();
    } catch {
      setSubmitError('Unable to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [completeOnboarding]);

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

            <VerificationUploadField
              config={config.upload}
              document={formValues.document}
              onDocumentChange={(document) =>
                setFormValues((current) => updateVerificationField(current, 'document', document))
              }
            />

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
