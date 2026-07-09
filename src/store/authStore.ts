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
  cancelDeliveryProviderRequest: () => void;
}

type AuthStore = AuthState & AuthActions;

const AUTH_PERSIST_VERSION = 3;

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

function getApplicableOnboarding(user: User | null, profile: OnboardingProfile | undefined) {
  if (!user?.id || !profile) {
    return emptyOnboardingState;
  }

  if (profile.onboardingComplete) {
    return applyOnboardingProfile(profile);
  }

  if (!profile.accountType) {
    return emptyOnboardingState;
  }

  if (profile.accountType === 'delivery') {
    const remoteStatus = useDeliveryPersonnelStore.getState().getStatusForUser(user.id);

    if (
      profile.deliveryProviderStatus === 'pending_company_confirmation' ||
      profile.deliveryProviderStatus === 'rejected'
    ) {
      const expectedStatus =
        profile.deliveryProviderStatus === 'pending_company_confirmation' ? 'pending' : 'rejected';

      if (remoteStatus !== expectedStatus) {
        return emptyOnboardingState;
      }
    }

    return applyOnboardingProfile(profile);
  }

  if (profile.accountType === 'construction') {
    return applyOnboardingProfile(profile);
  }

  return emptyOnboardingState;
}

function resolveActiveOnboarding(state: Pick<AuthState, 'user' | 'onboardingProfilesByUserId'>) {
  if (!state.user?.id) {
    return emptyOnboardingState;
  }

  return getApplicableOnboarding(state.user, state.onboardingProfilesByUserId[state.user.id]);
}

function migratePersistedAuth(persisted: unknown, version: number) {
  const state = (persisted ?? {}) as Partial<AuthState>;
  const profiles = { ...(state.onboardingProfilesByUserId ?? {}) };
  const userId = state.user?.id;

  if (version < AUTH_PERSIST_VERSION && userId && !profiles[userId] && state.accountType != null) {
    profiles[userId] = snapshotOnboarding(state as AuthState);
  }

  return {
    user: state.user ?? null,
    isAuthenticated: Boolean(state.isAuthenticated),
    onboardingProfilesByUserId: profiles,
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
            ...emptyOnboardingState,
            ...getApplicableOnboarding(user, profile),
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

          const { user, onboardingProfilesByUserId } = get();

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
              ...resolveActiveOnboarding({ user, onboardingProfilesByUserId }),
            });
            return;
          }

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            ...emptyOnboardingState,
          });
        },

        setAccountType: (accountType) => {
          set({
            ...emptyOnboardingState,
            accountType,
          });
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
            if (
              deliveryProviderStatus === 'pending_company_confirmation' ||
              deliveryProviderStatus === 'rejected'
            ) {
              set({
                ...emptyOnboardingState,
                accountType: null,
              });
              syncOnboardingProfile();
            }
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

        cancelDeliveryProviderRequest: () => {
          const userId = get().user?.id;
          if (userId) {
            useDeliveryPersonnelStore.getState().withdrawAssociationRequest(userId);
          }

          set({
            ...emptyOnboardingState,
            accountType: null,
          });
          syncOnboardingProfile();
        },
      };
    },
    {
      name: 'civicbuild-auth-storage',
      version: AUTH_PERSIST_VERSION,
      migrate: migratePersistedAuth,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingProfilesByUserId: state.onboardingProfilesByUserId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useAuthStore.setState({
            ...emptyOnboardingState,
            ...resolveActiveOnboarding(state),
          });
        }

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
