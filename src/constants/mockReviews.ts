export type ReviewSubjectType = 'product' | 'supplier';

export interface MockReview {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  text: string;
  verifiedPurchase?: boolean;
}

export interface RatingBreakdownRow {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percent: number;
}

export interface MockReviewSummary {
  averageRating: number;
  totalCount: number;
  breakdown: RatingBreakdownRow[];
  reviews: MockReview[];
}

const REVIEW_POOL: Omit<MockReview, 'id'>[] = [
  {
    reviewerName: 'Kwame Mensah',
    rating: 5,
    date: '2026-06-12',
    text: 'Solid quality and the bags were well stacked on delivery. My mason confirmed the grade was consistent batch to batch.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Ama Osei',
    rating: 4,
    date: '2026-05-28',
    text: 'Good product overall. Delivery arrived a few hours later than quoted, but the team called ahead which I appreciated.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Kofi Boateng',
    rating: 5,
    date: '2026-05-03',
    text: 'Exactly what we needed for a small extension project in East Legon. Pricing was fair compared to two other quotes I got.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Abena Darko',
    rating: 3,
    date: '2026-04-19',
    text: 'Material quality is fine, but one pallet had torn packaging. Supplier replaced it quickly after I sent photos.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Yaw Asante',
    rating: 4,
    date: '2026-04-02',
    text: 'Reliable for repeat orders. I use them for site supplies monthly and they usually have stock when others are out.',
  },
  {
    reviewerName: 'Efua Nyarko',
    rating: 5,
    date: '2026-03-21',
    text: 'Verified badge gave me confidence for a larger roofing order. Invoice and delivery note matched what was quoted in the app.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Nana Adjei',
    rating: 2,
    date: '2026-03-08',
    text: 'First order went smoothly, but the second delivery was short by two units. Support sorted it out after two follow-ups.',
  },
  {
    reviewerName: 'Maame Serwaa',
    rating: 4,
    date: '2026-02-25',
    text: 'Helpful staff at pickup. They helped load onto my pickup truck and double-checked the quantity before I left the yard.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Daniel Tetteh',
    rating: 5,
    date: '2026-02-10',
    text: 'Best experience so far on CivicBuild. Clear unit pricing, no hidden fees, and the driver knew the site entrance.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Rita Owusu',
    rating: 3,
    date: '2026-01-30',
    text: 'Average experience — product matched the listing, but communication on delivery window could be clearer for first-time buyers.',
  },
  {
    reviewerName: 'Isaac Quaye',
    rating: 4,
    date: '2026-01-14',
    text: 'Used for a boundary wall job in Tema. Blocks were uniform size and mortar adhesion was good according to our foreman.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Gifty Ankomah',
    rating: 5,
    date: '2025-12-22',
    text: 'Would order again. Saved them to Favorites and reordered in under a minute for a second site.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Samuel Aryee',
    rating: 1,
    date: '2025-12-05',
    text: 'Order was cancelled twice due to stock issues. Eventually fulfilled, but caused a one-week delay on our pour schedule.',
  },
  {
    reviewerName: 'Adjoa Mintah',
    rating: 4,
    date: '2025-11-18',
    text: 'Competitive price for steel rods in Accra. Minor surface rust on a few pieces, but within acceptable site tolerance.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Prince Anaxy',
    rating: 5,
    date: '2025-11-02',
    text: 'Great for a home renovation side project. Easy to compare suppliers on CivicBuild before committing to this one.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Felicia Ofori',
    rating: 4,
    date: '2025-10-20',
    text: 'Paint colour matched the swatch sample. Coverage was decent — needed one extra tin for our living room, which we expected.',
  },
  {
    reviewerName: 'Ebenezer Lamptey',
    rating: 3,
    date: '2025-10-03',
    text: 'Decent supplier for plumbing fittings. Some items were loose in the box; nothing broken, but packaging could be better.',
  },
  {
    reviewerName: 'Selasi Agbeko',
    rating: 5,
    date: '2025-09-15',
    text: 'Fast response on Messages when I asked about bulk gravel pricing. Ended up saving on transport by combining two deliveries.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Harriet Akoto',
    rating: 4,
    date: '2025-08-28',
    text: 'Good mix of value and reliability. Not the absolute cheapest, but consistent quality makes it worth it for client projects.',
    verifiedPurchase: true,
  },
  {
    reviewerName: 'Michael Odoi',
    rating: 2,
    date: '2025-08-10',
    text: 'Product was fine but the yard closed earlier than listed hours. Had to reschedule pickup and lost half a day on site.',
  },
];

function buildBreakdown(reviews: MockReview[]): RatingBreakdownRow[] {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[bucket] += 1;
  });

  const total = reviews.length || 1;

  return ([5, 4, 3, 2, 1] as const).map((stars) => ({
    stars,
    count: counts[stars],
    percent: Math.round((counts[stars] / total) * 100),
  }));
}

function buildSummary(reviews: MockReview[]): MockReviewSummary {
  const totalCount = reviews.length;
  const averageRating =
    totalCount === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / totalCount;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalCount,
    breakdown: buildBreakdown(reviews),
    reviews,
  };
}

function withIds(reviews: Omit<MockReview, 'id'>[], prefix: string): MockReview[] {
  return reviews.map((review, index) => ({
    ...review,
    id: `${prefix}-${index + 1}`,
  }));
}

function reviewsForKey(key: string): MockReview[] {
  const offset = Math.abs(hashCode(key)) % 4;
  const rotated = [...REVIEW_POOL.slice(offset), ...REVIEW_POOL.slice(0, offset)];
  return withIds(rotated, key.replace(/[^a-z0-9]+/gi, '-'));
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const ENTITY_OVERRIDES: Record<string, MockReviewSummary> = {
  'supplier:west-africa-cement': buildSummary(withIds(REVIEW_POOL, 'wac')),
  'supplier:buildstrong-ltd': buildSummary(withIds(REVIEW_POOL.slice(2), 'bsl')),
  'product:cement-1': buildSummary(withIds(REVIEW_POOL.slice(1), 'cement-1')),
  'product:cement-2': buildSummary(withIds(REVIEW_POOL.slice(3), 'cement-2')),
};

export function getMockReviewSummary(
  subjectType: ReviewSubjectType,
  subjectId: string,
): MockReviewSummary {
  const key = `${subjectType}:${subjectId}`;
  if (ENTITY_OVERRIDES[key]) {
    return ENTITY_OVERRIDES[key];
  }

  return buildSummary(reviewsForKey(key));
}

export function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
