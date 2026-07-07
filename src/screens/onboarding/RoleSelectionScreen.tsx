import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const setAccountType = useAuthStore((state) => state.setAccountType);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const logout = useAuthStore((state) => state.logout);

  const handleContinue = () => {
    setAccountType(selectedRole);

    const step = getOnboardingStep(selectedRole);

    if (step === 'complete') {
      completeOnboarding();
      return;
    }

    navigation.navigate(ONBOARDING_SCREEN_BY_STEP[step]);
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

          <View style={styles.actions}>
            <OnboardingContinueButton onPress={handleContinue} />
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
});
