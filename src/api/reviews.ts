import type { ApiResponse } from '@appTypes/api';
import type {
  BackendReview,
  CreateReviewInput,
  MyReviewsSummary,
  RatingBreakdownRow,
  Review,
  ReviewSubjectType,
  ReviewSummary,
  UpdateReviewInput,
  UserWrittenReview,
} from '@appTypes/reviewsApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function buildBreakdownFromReviews(reviews: BackendReview[]): RatingBreakdownRow[] {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const stars = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[stars] += 1;
  }
  const total = reviews.length || 1;
  return ([5, 4, 3, 2, 1] as const).map((stars) => ({
    stars,
    count: counts[stars],
    percent: Math.round((counts[stars] / total) * 100),
  }));
}

export function mapBackendReview(review: BackendReview): Review {
  return {
    id: review.id,
    reviewerName: review.reviewerName,
    rating: review.rating,
    date: review.createdAt,
    text: review.text,
    verifiedPurchase: review.verifiedPurchase,
  };
}

export async function getReviews(
  subjectType: ReviewSubjectType,
  subjectId: string,
): Promise<ApiResult<Review[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendReview[]>>('/api/reviews', { params: { subjectType, subjectId } })
      .then((response) => unwrapApiResponse(response.data).map(mapBackendReview)),
  );
}

export async function getReviewSummary(
  subjectType: ReviewSubjectType,
  subjectId: string,
): Promise<ApiResult<ReviewSummary>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<{ averageRating: number; totalCount: number; breakdown: unknown[] }>>(
        '/api/reviews/summary',
        { params: { subjectType, subjectId } },
      )
      .then(async (response) => {
        const data = unwrapApiResponse(response.data);
        const reviewsResult = await getReviews(subjectType, subjectId);
        const breakdown =
          reviewsResult.ok && reviewsResult.data.length > 0
            ? buildBreakdownFromReviews(
                reviewsResult.data.map((r) => ({
                  id: r.id,
                  subjectType,
                  subjectId,
                  reviewerName: r.reviewerName,
                  rating: r.rating,
                  text: r.text,
                  verifiedPurchase: r.verifiedPurchase ?? false,
                  createdAt: r.date,
                })),
              )
            : ([5, 4, 3, 2, 1] as const).map((stars) => ({ stars, count: 0, percent: 0 }));
        return {
          averageRating: data.averageRating,
          totalCount: data.totalCount,
          breakdown,
        };
      }),
  );
}

export async function getMyReviews(): Promise<ApiResult<BackendReview[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendReview[]>>('/api/reviews/me')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getMyReviewsForDisplay(): Promise<ApiResult<Review[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendReview[]>>('/api/reviews/me')
      .then((response) => unwrapApiResponse(response.data).map(mapBackendReview)),
  );
}

export async function createReview(input: CreateReviewInput): Promise<ApiResult<Review>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendReview>>('/api/reviews', input)
      .then((response) => mapBackendReview(unwrapApiResponse(response.data))),
  );
}

export async function updateReview(
  reviewId: string,
  input: UpdateReviewInput,
): Promise<ApiResult<Review>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendReview>>(`/api/reviews/${reviewId}`, input)
      .then((response) => mapBackendReview(unwrapApiResponse(response.data))),
  );
}

export async function deleteReview(reviewId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>(`/api/reviews/${reviewId}`).then(() => null),
  );
}

export function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getMyReviewsSummary(reviews: { rating: number }[]): {
  totalCount: number;
  averageRatingGiven: number;
} {
  if (reviews.length === 0) {
    return { totalCount: 0, averageRatingGiven: 0 };
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return {
    totalCount: reviews.length,
    averageRatingGiven: sum / reviews.length,
  };
}

export function getMyReviewsDetailSummary(reviews: UserWrittenReview[]): MyReviewsSummary {
  const productCount = reviews.filter((review) => review.type === 'product').length;
  const supplierCount = reviews.filter((review) => review.type === 'supplier').length;
  const { totalCount, averageRatingGiven } = getMyReviewsSummary(
    reviews.map((review) => ({
      id: review.id,
      reviewerName: '',
      rating: review.rating,
      date: review.date,
      text: review.text,
    })),
  );

  return {
    totalCount,
    productCount,
    supplierCount,
    averageRatingGiven,
    reviews,
  };
}
