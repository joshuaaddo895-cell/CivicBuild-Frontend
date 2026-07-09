import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DeliveryProviderSetupScreenProps } from '@appTypes/navigation';
import { AuthDecorBackground, AuthErrorBanner, AuthInput } from '@components/auth';
import { ConstructionAgencySelect, ProfilePhotoPicker } from '@components/delivery';
import { OnboardingContinueButton, OnboardingHeader } from '@components/onboarding';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { formatUserDisplayName } from '@utils/mockAuth';

export default function DeliveryProviderSetupScreen({
  navigation,
}: DeliveryProviderSetupScreenProps) {
  const user = useAuthStore((state) => state.user);
  const submitDeliveryProviderSetup = useAuthStore((state) => state.submitDeliveryProviderSetup);

  const defaultFullName = useMemo(() => formatUserDisplayName(user), [user]);

  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState(defaultFullName);
  const [constructionAgencyId, setConstructionAgencyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    setSubmitError('');

    if (!constructionAgencyId) {
      setSubmitError('Please select a construction company to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      submitDeliveryProviderSetup({
        profileImageUri,
        fullName: fullName.trim() || defaultFullName,
        constructionAgencyId,
        vehicleInfo: 'Delivery vehicle · Greater Accra',
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
              subtitle="Complete your profile and link to a construction company on CivicBuild."
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

              <ConstructionAgencySelect
                selectedAgencyId={constructionAgencyId}
                onSelect={setConstructionAgencyId}
              />

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
