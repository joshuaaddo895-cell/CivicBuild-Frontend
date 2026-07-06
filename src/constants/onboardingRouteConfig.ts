import type { AccountType, OnboardingStep } from '@appTypes/onboarding';

export const ONBOARDING_STEP_BY_ROLE: Record<AccountType, OnboardingStep> = {
  customer: 'complete',
  construction: 'verification',
  delivery: 'delivery_setup',
};

export function getOnboardingStep(accountType: AccountType): OnboardingStep {
  return ONBOARDING_STEP_BY_ROLE[accountType];
}

export const ONBOARDING_SCREEN_BY_STEP: Record<
  Exclude<OnboardingStep, 'complete'>,
  'Verification' | 'DeliveryProviderSetup'
> = {
  verification: 'Verification',
  delivery_setup: 'DeliveryProviderSetup',
};
