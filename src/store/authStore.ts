import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@appTypes/api';
import type {
  AccountType,
  DeliveryProviderProfile,
  DeliveryProviderStatus,
  VerificationStatus,
} from '@appTypes/onboarding';
import { useDeliveryPersonnelStore } from '@store/deliveryPersonnelStore';
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveStoredTokens,
} from '@utils/tokenStorage';

interface OnboardingProfile {
  accountType: AccountType | null;
  onboardingComplete: boolean;
  verificationStatus: VerificationStatus | null;
  deliveryProviderProfile: DeliveryProviderProfile | null;
  deliveryProviderStatus: DeliveryProviderStatus;
  managedAgencyId: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  accountType: AccountType | null;
  onboardingComplete: boolean;
  verificationStatus: VerificationStatus | null;
  deliveryProviderProfile: DeliveryProviderProfile | null;
  deliveryProviderStatus: DeliveryProviderStatus;
  managedAgencyId: string | null;
  onboardingProfilesByUserId: Record<string, OnboardingProfile>;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: (options?: { wipeOnboarding?: boolean }) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  restoreSessionFromSecureStorage: () => Promise<void>;
  setAccountType: (accountType: AccountType) => void;
  completeOnboarding: () => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setDeliveryProviderProfile: (profile: DeliveryProviderProfile) => void;
  submitDeliveryProviderSetup: (profile: DeliveryProviderProfile) => void;
  approveDeliveryProvider: () => void;
  rejectDeliveryProvider: () => void;
  setManagedAgencyId: (agencyId: string) => void;
  syncDeliveryProviderApproval: () => void;
}

type AuthStore = AuthState & AuthActions;

const emptyOnboardingState: Pick<
  AuthState,
  | 'accountType'
  | 'onboardingComplete'
  | 'verificationStatus'
  | 'deliveryProviderProfile'
  | 'deliveryProviderStatus'
  | 'managedAgencyId'
> = {
  accountType: null,
  onboardingComplete: false,
  verificationStatus: null,
  deliveryProviderProfile: null,
  deliveryProviderStatus: 'none',
  managedAgencyId: null,
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  ...emptyOnboardingState,
  onboardingProfilesByUserId: {},
};

function snapshotOnboarding(state: AuthState): OnboardingProfile {
  return {
    accountType: state.accountType,
    onboardingComplete: state.onboardingComplete,
    verificationStatus: state.verificationStatus,
    deliveryProviderProfile: state.deliveryProviderProfile,
    deliveryProviderStatus: state.deliveryProviderStatus,
    managedAgencyId: state.managedAgencyId,
  };
}

function applyOnboardingProfile(profile: OnboardingProfile | undefined) {
  if (!profile) {
    return emptyOnboardingState;
  }

  return {
    accountType: profile.accountType,
    onboardingComplete: profile.onboardingComplete,
    verificationStatus: profile.verificationStatus,
    deliveryProviderProfile: profile.deliveryProviderProfile,
    deliveryProviderStatus: profile.deliveryProviderStatus,
    managedAgencyId: profile.managedAgencyId,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      const syncOnboardingProfile = () => {
        const state = get();
        if (!state.user?.id) {
          return;
        }

        set({
          onboardingProfilesByUserId: {
            ...state.onboardingProfilesByUserId,
            [state.user.id]: snapshotOnboarding(state),
          },
        });
      };

      return {
        ...initialState,

        login: async (user, accessToken, refreshToken) => {
          await saveStoredTokens(accessToken, refreshToken);
          const profile = get().onboardingProfilesByUserId[user.id];
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            ...applyOnboardingProfile(profile),
          });
        },

        logout: async (options) => {
          const state = get();
          let profiles = state.onboardingProfilesByUserId;

          if (!options?.wipeOnboarding && state.user?.id) {
            profiles = {
              ...profiles,
              [state.user.id]: snapshotOnboarding(state),
            };
          }

          await clearStoredTokens();
          set({
            ...initialState,
            hasHydrated: true,
            onboardingProfilesByUserId: options?.wipeOnboarding ? {} : profiles,
          });
        },

        updateUser: (partialUser) => {
          const current = get().user;
          if (current) {
            set({ user: { ...current, ...partialUser } });
          }
        },

        setTokens: async (accessToken, refreshToken) => {
          await saveStoredTokens(accessToken, refreshToken);
          set({ accessToken, refreshToken, isAuthenticated: true });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setHasHydrated: (hasHydrated) => {
          set({ hasHydrated });
        },

        restoreSessionFromSecureStorage: async () => {
          const [accessToken, refreshToken] = await Promise.all([
            getStoredAccessToken(),
            getStoredRefreshToken(),
          ]);

          if (accessToken && refreshToken) {
            const { user, onboardingProfilesByUserId } = get();
            const profile = user?.id ? onboardingProfilesByUserId[user.id] : undefined;

            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
              ...(profile ? applyOnboardingProfile(profile) : {}),
            });
            return;
          }

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },

        setAccountType: (accountType) => {
          set({ accountType });
          syncOnboardingProfile();
        },

        completeOnboarding: () => {
          set({ onboardingComplete: true });
          syncOnboardingProfile();
        },

        setVerificationStatus: (status) => {
          set({ verificationStatus: status });
          syncOnboardingProfile();
        },

        setDeliveryProviderProfile: (profile) => {
          set({ deliveryProviderProfile: profile });
          syncOnboardingProfile();
        },

        submitDeliveryProviderSetup: (profile) => {
          const userId = get().user?.id ?? null;
          useDeliveryPersonnelStore.getState().submitAssociationRequest(profile, userId);

          set({
            deliveryProviderProfile: profile,
            deliveryProviderStatus: 'pending_company_confirmation',
          });
          syncOnboardingProfile();
        },

        approveDeliveryProvider: () => {
          set({
            deliveryProviderStatus: 'approved',
            onboardingComplete: true,
          });
          syncOnboardingProfile();
        },

        rejectDeliveryProvider: () => {
          set({
            deliveryProviderStatus: 'rejected',
          });
          syncOnboardingProfile();
        },

        setManagedAgencyId: (agencyId) => {
          set({ managedAgencyId: agencyId });
          syncOnboardingProfile();
        },

        syncDeliveryProviderApproval: () => {
          const { user, accountType, deliveryProviderStatus } = get();
          if (accountType !== 'delivery' || !user?.id) {
            return;
          }

          const remoteStatus = useDeliveryPersonnelStore.getState().getStatusForUser(user.id);
          if (!remoteStatus) {
            return;
          }

          if (remoteStatus === 'approved' && deliveryProviderStatus !== 'approved') {
            get().approveDeliveryProvider();
            return;
          }

          if (remoteStatus === 'rejected' && deliveryProviderStatus !== 'rejected') {
            get().rejectDeliveryProvider();
          }
        },
      };
    },
    {
      name: 'civicbuild-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accountType: state.accountType,
        onboardingComplete: state.onboardingComplete,
        verificationStatus: state.verificationStatus,
        deliveryProviderProfile: state.deliveryProviderProfile,
        deliveryProviderStatus: state.deliveryProviderStatus,
        managedAgencyId: state.managedAgencyId,
        onboardingProfilesByUserId: state.onboardingProfilesByUserId,
      }),
      onRehydrateStorage: () => () => {
        (async () => {
          await useAuthStore.getState().restoreSessionFromSecureStorage();
          useAuthStore.getState().setHasHydrated(true);
        })().catch(() => undefined);
      },
    },
  ),
);

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
export const selectAccountType = (state: AuthStore) => state.accountType;
export const selectOnboardingComplete = (state: AuthStore) => state.onboardingComplete;
export const selectHasHydrated = (state: AuthStore) => state.hasHydrated;
