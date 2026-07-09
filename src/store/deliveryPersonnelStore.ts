import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DeliveryPersonnelRecord, PersonnelApprovalStatus } from '@appTypes/agency';
import type { DeliveryProviderProfile } from '@appTypes/onboarding';

const SEED_PERSONNEL: DeliveryPersonnelRecord[] = [
  {
    id: 'personnel-seed-1',
    userId: null,
    profileImageUri:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    fullName: 'Samuel Boateng',
    constructionAgencyId: 'buildstrong-ltd',
    vehicleInfo: 'Tipper truck · 10-ton capacity',
    approvalStatus: 'approved',
    submittedAt: '2026-01-15T09:00:00.000Z',
    handledAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'personnel-seed-2',
    userId: null,
    profileImageUri:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    fullName: 'Daniel Adjei',
    constructionAgencyId: 'buildstrong-ltd',
    vehicleInfo: 'Flatbed pickup · Accra metro',
    approvalStatus: 'approved',
    submittedAt: '2026-02-01T11:30:00.000Z',
    handledAt: '2026-02-02T08:45:00.000Z',
  },
];

interface DeliveryPersonnelState {
  personnel: DeliveryPersonnelRecord[];
  hasSeeded: boolean;
}

interface DeliveryPersonnelActions {
  seedIfNeeded: () => void;
  submitAssociationRequest: (
    profile: DeliveryProviderProfile,
    userId: string | null,
  ) => DeliveryPersonnelRecord;
  getPendingByAgencyId: (agencyId: string) => DeliveryPersonnelRecord[];
  getApprovedByAgencyId: (agencyId: string) => DeliveryPersonnelRecord[];
  getStatusForUser: (userId: string | null | undefined) => PersonnelApprovalStatus | null;
  approvePersonnel: (personnelId: string) => DeliveryPersonnelRecord | undefined;
  rejectPersonnel: (personnelId: string) => DeliveryPersonnelRecord | undefined;
  findPersonnelByUserId: (userId: string) => DeliveryPersonnelRecord | undefined;
}

type DeliveryPersonnelStore = DeliveryPersonnelState & DeliveryPersonnelActions;

function buildPersonnelRecord(
  profile: DeliveryProviderProfile,
  userId: string | null,
): DeliveryPersonnelRecord {
  return {
    id: `personnel-${userId ?? Date.now()}`,
    userId,
    profileImageUri: profile.profileImageUri,
    fullName: profile.fullName,
    constructionAgencyId: profile.constructionAgencyId ?? '',
    vehicleInfo: profile.vehicleInfo ?? 'Delivery vehicle · Greater Accra',
    approvalStatus: 'pending',
    submittedAt: new Date().toISOString(),
  };
}

export const useDeliveryPersonnelStore = create<DeliveryPersonnelStore>()(
  persist(
    (set, get) => ({
      personnel: [],
      hasSeeded: false,

      seedIfNeeded: () => {
        if (get().hasSeeded) {
          return;
        }

        set({
          personnel: SEED_PERSONNEL,
          hasSeeded: true,
        });
      },

      submitAssociationRequest: (profile, userId) => {
        get().seedIfNeeded();

        const existing = userId
          ? get().personnel.find((entry) => entry.userId === userId)
          : undefined;

        const record = buildPersonnelRecord(profile, userId);

        if (existing) {
          set((state) => ({
            personnel: state.personnel.map((entry) =>
              entry.id === existing.id
                ? {
                    ...record,
                    id: existing.id,
                    approvalStatus: 'pending',
                    submittedAt: new Date().toISOString(),
                    handledAt: undefined,
                  }
                : entry,
            ),
          }));
          return {
            ...record,
            id: existing.id,
          };
        }

        set((state) => ({
          personnel: [record, ...state.personnel],
        }));

        return record;
      },

      getPendingByAgencyId: (agencyId) => {
        get().seedIfNeeded();
        return get()
          .personnel.filter(
            (entry) =>
              entry.constructionAgencyId === agencyId && entry.approvalStatus === 'pending',
          )
          .sort(
            (left, right) =>
              new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
          );
      },

      getApprovedByAgencyId: (agencyId) => {
        get().seedIfNeeded();
        return get()
          .personnel.filter(
            (entry) =>
              entry.constructionAgencyId === agencyId && entry.approvalStatus === 'approved',
          )
          .sort(
            (left, right) =>
              new Date(right.handledAt ?? right.submittedAt).getTime() -
              new Date(left.handledAt ?? left.submittedAt).getTime(),
          );
      },

      getStatusForUser: (userId) => {
        if (!userId) {
          return null;
        }

        get().seedIfNeeded();
        return get().personnel.find((entry) => entry.userId === userId)?.approvalStatus ?? null;
      },

      findPersonnelByUserId: (userId) => {
        get().seedIfNeeded();
        return get().personnel.find((entry) => entry.userId === userId);
      },

      approvePersonnel: (personnelId) => {
        get().seedIfNeeded();
        let updated: DeliveryPersonnelRecord | undefined;

        set((state) => ({
          personnel: state.personnel.map((entry) => {
            if (entry.id !== personnelId) {
              return entry;
            }

            updated = {
              ...entry,
              approvalStatus: 'approved',
              handledAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));

        return updated;
      },

      rejectPersonnel: (personnelId) => {
        get().seedIfNeeded();
        let updated: DeliveryPersonnelRecord | undefined;

        set((state) => ({
          personnel: state.personnel.map((entry) => {
            if (entry.id !== personnelId) {
              return entry;
            }

            updated = {
              ...entry,
              approvalStatus: 'rejected',
              handledAt: new Date().toISOString(),
            };
            return updated;
          }),
        }));

        return updated;
      },
    }),
    {
      name: 'civicbuild-delivery-personnel-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        personnel: state.personnel,
        hasSeeded: state.hasSeeded,
      }),
    },
  ),
);
