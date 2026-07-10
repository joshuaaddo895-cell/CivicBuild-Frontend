import type { AgencyPostType, AgencyProfileDetails } from '@appTypes/agency';
import type { ApiResponse } from '@appTypes/api';
import type { BackendProduct } from '@appTypes/catalog';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { getMultipartUploadConfig } from '@utils/multipartUpload';
import { buildMultipartFormData } from '@utils/uploadValidation';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

export interface BackendAgency {
  id: string;
  name: string;
  logoUrl?: string | null;
  verified: boolean;
  category: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  hours?: string;
  services?: string[];
}

export interface CreateAgencyInput {
  name: string;
  category: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  hours?: string;
  services?: string[];
}

export interface AgencyProductInput {
  name: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  description: string;
  brand?: string;
  spec?: string;
  deliveryEstimate?: string;
}

export interface AgencyPostInput {
  type: AgencyPostType;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export interface BackendAgencyPost {
  id: string;
  agencyId: string;
  type: AgencyPostType;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPortfolioImage {
  imageId: string;
  deliveryUrl: string;
}

export interface PaginatedAgencies {
  items: BackendAgency[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export function mapAgencyToProfileDetails(agency: BackendAgency): AgencyProfileDetails {
  return {
    tagline: agency.tagline ?? '',
    description: agency.description ?? '',
    address: agency.address ?? '',
    phone: agency.phone ?? '',
    hours: agency.hours ?? '',
    services: agency.services ?? [],
    portfolioImageUris: [],
  };
}

export async function createAgency(input: CreateAgencyInput): Promise<ApiResult<BackendAgency>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendAgency>>('/api/agencies', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getMyAgency(): Promise<ApiResult<BackendAgency>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgency>>('/api/agencies/me')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function patchMyAgency(
  input: Partial<CreateAgencyInput>,
): Promise<ApiResult<BackendAgency>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendAgency>>('/api/agencies/me', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function listAgencies(
  q?: string,
  page = 0,
  limit = 20,
): Promise<ApiResult<PaginatedAgencies>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<PaginatedAgencies>>('/api/agencies', { params: { q, page, limit } })
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getAgency(agencyId: string): Promise<ApiResult<BackendAgency>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgency>>(`/api/agencies/${agencyId}`)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function uploadAgencyProductImage(
  file: LocalUploadFile,
): Promise<ApiResult<{ imageUrl: string }>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<{ imageUrl: string }>>(
        '/api/agencies/me/products/upload-image',
        buildMultipartFormData(file),
        getMultipartUploadConfig(),
      )
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function createAgencyProduct(
  input: AgencyProductInput,
): Promise<ApiResult<BackendProduct>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendProduct>>('/api/agencies/me/products', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function updateAgencyProduct(
  productId: string,
  input: Partial<AgencyProductInput>,
): Promise<ApiResult<BackendProduct>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendProduct>>(`/api/agencies/me/products/${productId}`, input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function deleteAgencyProduct(productId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>(`/api/agencies/me/products/${productId}`).then(() => null),
  );
}

export async function getMyAgencyPosts(): Promise<ApiResult<BackendAgencyPost[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgencyPost[]>>('/api/agencies/me/posts')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getAgencyPosts(agencyId: string): Promise<ApiResult<BackendAgencyPost[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgencyPost[]>>(`/api/agencies/${agencyId}/posts`)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function createAgencyPost(
  input: AgencyPostInput,
): Promise<ApiResult<BackendAgencyPost>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendAgencyPost>>('/api/agencies/me/posts', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function updateAgencyPost(
  postId: string,
  input: Partial<AgencyPostInput>,
): Promise<ApiResult<BackendAgencyPost>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendAgencyPost>>(`/api/agencies/me/posts/${postId}`, input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function deleteAgencyPost(postId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>(`/api/agencies/me/posts/${postId}`).then(() => null),
  );
}

export async function getMyPortfolio(): Promise<ApiResult<BackendPortfolioImage[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendPortfolioImage[]>>('/api/agencies/me/portfolio')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getAgencyPortfolio(
  agencyId: string,
): Promise<ApiResult<BackendPortfolioImage[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendPortfolioImage[]>>(`/api/agencies/${agencyId}/portfolio`)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function deletePortfolioImage(imageId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>(`/api/agencies/me/portfolio/${imageId}`).then(() => null),
  );
}

export interface BackendPersonnel {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl?: string | null;
  constructionAgencyId: string;
  vehicleInfo?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  handledAt?: string | null;
}

export async function getAgencyPersonnel(): Promise<ApiResult<BackendPersonnel[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendPersonnel[]>>('/api/agencies/me/personnel')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function approvePersonnel(personnelId: string): Promise<ApiResult<BackendPersonnel>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendPersonnel>>(`/api/agencies/me/personnel/${personnelId}/approve`)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function rejectPersonnel(personnelId: string): Promise<ApiResult<BackendPersonnel>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendPersonnel>>(`/api/agencies/me/personnel/${personnelId}/reject`)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function removePersonnel(personnelId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient
      .delete<ApiResponse<null>>(`/api/agencies/me/personnel/${personnelId}`)
      .then(() => null),
  );
}
