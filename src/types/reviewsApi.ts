export type ReviewSubjectType = 'product' | 'supplier';

export interface BackendReview {
  id: string;
  subjectType: ReviewSubjectType;
  subjectId: string;
  reviewerName: string;
  rating: number;
  text: string;
  verifiedPurchase: boolean;
  orderNumber?: string;
  createdAt: string;
}

export interface RatingBreakdownRow {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percent: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  breakdown: RatingBreakdownRow[];
}

export interface CreateReviewInput {
  subjectType: ReviewSubjectType;
  subjectId: string;
  rating: number;
  text?: string;
  verifiedPurchase?: boolean;
  orderNumber?: string;
}

export interface UpdateReviewInput {
  rating: number;
  text?: string;
}

/** UI-facing review shape used by ReviewCard and lists. */
export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  text: string;
  verifiedPurchase?: boolean;
}

export type MyReviewType = 'product' | 'supplier';

export interface UserWrittenReview {
  id: string;
  type: MyReviewType;
  subjectId: string;
  subjectName: string;
  subjectImageUri: string;
  supplierName?: string;
  category?: string;
  rating: number;
  date: string;
  text: string;
  orderNumber?: string;
}

export interface MyReviewsSummary {
  totalCount: number;
  productCount: number;
  supplierCount: number;
  averageRatingGiven: number;
  reviews: UserWrittenReview[];
}
