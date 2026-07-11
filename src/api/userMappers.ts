import type { User } from '@appTypes/api';
import { parseDisplayName } from '@utils/userDisplay';

import { mapBackendUserToUser } from './authTypes';

export interface BackendUserResponse {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  verificationStatus?: string;
  active?: boolean;
  profilePictureUrl?: string | null;
  createdAt?: string;
}

export function mapBackendUserResponse(data: BackendUserResponse, current?: User | null): User {
  const email = data.email || current?.email || '';
  const { firstName, lastName } = parseDisplayName(
    data.fullName,
    current ? `${current.firstName} ${current.lastName}`.trim() : email.split('@')[0] || 'User',
  );

  const mapped = mapBackendUserToUser(
    {
      id: data.id,
      email,
      fullName: data.fullName,
      role: data.role,
      verificationStatus: data.verificationStatus,
    },
    email,
  );

  return {
    ...mapped,
    firstName,
    lastName,
    avatar: data.profilePictureUrl ?? current?.avatar,
    createdAt: data.createdAt ?? current?.createdAt ?? mapped.createdAt,
    updatedAt: new Date().toISOString(),
  };
}
