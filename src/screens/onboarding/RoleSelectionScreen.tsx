import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboarding as completeOnboardingApi, patchOnboarding } from '@api/onboarding';
import type { RoleSelectionScreenProps } from '@appTypes/navigation';
import type { AccountType } from '@appTypes/onboarding';
import { AuthDecorBackground, AuthFooterLink } from '@components/auth';
import { OnboardingContinueButton, OnboardingHeader, RoleCard } from '@components/onboarding';
import { getOnboardingStep, ONBOARDING_SCREEN_BY_STEP } from '@constants/onboardingRouteConfig';
import { ROLE_OPTIONS } from '@constants/roleOptions';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

export default function RoleSelectionScreen({ navigation }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<AccountType>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const applyServerOnboarding = useAuthStore((state) => state.applyServerOnboarding);
  const logout = useAuthStore((state) => state.logout);

  const handleContinue = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const patchResult = await patchOnboarding({ accountType: selectedRole });
      if (!patchResult.ok) {
        setErrorMessage(patchResult.error.message);
        return;
      }

      applyServerOnboarding(patchResult.data);

      const step = getOnboardingStep(selectedRole);

      if (step === 'complete') {
        const completeResult = await completeOnboardingApi();
        if (!completeResult.ok) {
          setErrorMessage(completeResult.error.message);
          return;
        }
        applyServerOnboarding(completeResult.data);
        return;
      }

      navigation.navigate(ONBOARDING_SCREEN_BY_STEP[step]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogIn = () => {
    void logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <OnboardingHeader
            title="Choose Your Account Type"
            subtitle="Select how you'll use CivicBuild. This determines your dashboard and permissions."
          />

          <View style={styles.roleList}>
            {ROLE_OPTIONS.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole === role.id}
                onPress={() => setSelectedRole(role.id)}
              />
            ))}
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <OnboardingContinueButton loading={isSubmitting} onPress={handleContinue} />
            <AuthFooterLink
              prompt="Already have an account?"
              linkText="Log In"
              onPress={handleLogIn}
            />
          </View>
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
  },
  inner: {
    width: '100%',
    maxWidth: 512,
    alignSelf: 'center',
    flex: 1,
  },
  roleList: {
    gap: theme.spacing.gutter,
    marginBottom: theme.spacing.stackLg,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: 'auto',
    paddingTop: theme.spacing.stackMd,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
