import type { BackendAgencyPost } from '@api/agencies';
import type { AgencyPost } from '@appTypes/agency';

export function mapBackendAgencyPost(post: BackendAgencyPost): AgencyPost {
  return {
    id: post.id,
    agencyId: post.agencyId,
    type: post.type,
    title: post.title,
    description: post.description,
    imageUri: post.imageUrl ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export { isLocalUploadUri as isLocalImageUri } from './uploadValidation';
