import type { ApiResponse } from '@appTypes/api';
import type { VerificationStatus } from '@appTypes/onboarding';
import type { BackendOnboardingState, PatchOnboardingInput } from '@appTypes/onboardingApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function normalizeVerificationStatus(
  status: BackendOnboardingState['verificationStatus'],
): VerificationStatus | null {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase();
  if (normalized === 'verified') return 'verified';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'pending') return 'pending';
  return null;
}

export function mapBackendOnboarding(data: BackendOnboardingState) {
  return {
    accountType: data.accountType,
    onboardingComplete: data.onboardingComplete,
    verificationStatus: normalizeVerificationStatus(data.verificationStatus),
    managedAgencyId: data.managedAgencyId,
    deliveryProviderProfile: data.deliveryProviderProfile,
    deliveryProviderStatus: data.deliveryProviderStatus ?? 'none',
  };
}

export async function getOnboarding(): Promise<ApiResult<ReturnType<typeof mapBackendOnboarding>>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendOnboardingState>>('/api/users/me/onboarding')
      .then((response) => mapBackendOnboarding(unwrapApiResponse(response.data))),
  );
}

export async function patchOnboarding(
  input: PatchOnboardingInput,
): Promise<ApiResult<ReturnType<typeof mapBackendOnboarding>>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendOnboardingState>>('/api/users/me/onboarding', input)
      .then((response) => mapBackendOnboarding(unwrapApiResponse(response.data))),
  );
}

export async function completeOnboarding(): Promise<
  ApiResult<ReturnType<typeof mapBackendOnboarding>>
> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendOnboardingState>>('/api/users/me/onboarding/complete')
      .then((response) => mapBackendOnboarding(unwrapApiResponse(response.data))),
  );
}
