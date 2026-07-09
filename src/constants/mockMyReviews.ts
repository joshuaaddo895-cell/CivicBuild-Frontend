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

export const MOCK_USER_REVIEWS: UserWrittenReview[] = [
  {
    id: 'my-review-1',
    type: 'product',
    subjectId: 'cement-1',
    subjectName: 'GHACEM Super Rapid Cement 42.5R (50kg)',
    subjectImageUri:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80',
    supplierName: 'Accra Cement Depot',
    category: 'Cement',
    rating: 5,
    date: '2026-06-18',
    text: 'Arrived on time and the bags were intact. Used for a slab pour in Osu — no clumping and easy to work with.',
    orderNumber: 'CB-10482',
  },
  {
    id: 'my-review-2',
    type: 'supplier',
    subjectId: 'west-africa-cement',
    subjectName: 'West Africa Cement',
    subjectImageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU6z37ivgb9E8BnrC7zMlkwk_Sa3sYQanhVtqGz4DlVXcp-fp42BFblf2MDj-Yf_IKRKMwGIQ27MgrPGN7o43_WR1ya6CYD5NGhpNb7GtQkHUyhe5TfzBtRoo1PbweNnGwH5ZK9K5QwKFp0Elc9x2nUi1W7nDrooqcIcE5fsg_NMPU-8qjLi94eLwyMhOMZSSbKRFhCH8YtpUwgcNt40-kMsoJ0NPw0v33fhDoXqgDKUMWv2jGth9W',
    category: 'Cement',
    rating: 4,
    date: '2026-05-30',
    text: 'Reliable for repeat orders. Yard staff helped load quickly and the invoice matched the app quote exactly.',
    orderNumber: 'CB-10391',
  },
  {
    id: 'my-review-3',
    type: 'product',
    subjectId: 'blocks-1',
    subjectName: 'Solid Sandcrete Block 6" (450×225×150mm)',
    subjectImageUri:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
    supplierName: 'BlockMaster Ghana',
    category: 'Blocks',
    rating: 4,
    date: '2026-05-12',
    text: 'Blocks were uniform and clean. One pallet had two chipped units — supplier replaced them without hassle.',
    orderNumber: 'CB-10267',
  },
  {
    id: 'my-review-4',
    type: 'product',
    subjectId: 'steel-2',
    subjectName: 'Y12 High-Tensile Steel Rods (6m)',
    subjectImageUri:
      'https://images.unsplash.com/photo-1565195164432-7b915e3fac8b?auto=format&fit=crop&w=200&q=80',
    supplierName: 'SteelPro Accra',
    category: 'Steel',
    rating: 5,
    date: '2026-04-22',
    text: 'Straight rods, correct diameter, and bundled well for transport. Foreman signed off on the batch immediately.',
    orderNumber: 'CB-10154',
  },
  {
    id: 'my-review-5',
    type: 'supplier',
    subjectId: 'buildstrong-ltd',
    subjectName: 'BuildStrong Ltd',
    subjectImageUri:
      'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=200&q=80',
    category: 'General',
    rating: 3,
    date: '2026-03-28',
    text: 'Good pricing on mixed materials, but delivery window shifted twice. Product quality was still solid when it arrived.',
    orderNumber: 'CB-10088',
  },
  {
    id: 'my-review-6',
    type: 'product',
    subjectId: 'roofing-1',
    subjectName: 'Aluzinc Roofing Sheet 0.45mm (3.6m)',
    subjectImageUri:
      'https://images.unsplash.com/photo-1632778149955-9c7f7370e4e8?auto=format&fit=crop&w=200&q=80',
    supplierName: 'RoofTech Supplies',
    category: 'Roofing',
    rating: 5,
    date: '2026-02-14',
    text: 'Colour matched the sample perfectly. Sheets were scratch-free and the driver helped offload at a tight site entrance.',
    orderNumber: 'CB-09912',
  },
  {
    id: 'my-review-7',
    type: 'product',
    subjectId: 'paint-3',
    subjectName: 'Dulux Weather Shield Exterior (20L)',
    subjectImageUri:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80',
    supplierName: 'ColourHouse Ghana',
    category: 'Paint',
    rating: 4,
    date: '2026-01-08',
    text: 'Good coverage on exterior walls. Needed one extra tin for corners — expected for textured surfaces.',
    orderNumber: 'CB-09741',
  },
  {
    id: 'my-review-8',
    type: 'supplier',
    subjectId: 'gravel-kings',
    subjectName: 'Gravel Kings Ltd',
    subjectImageUri:
      'https://images.unsplash.com/photo-1618220147828-4f7c3d7f7b93?auto=format&fit=crop&w=200&q=80',
    category: 'Gravel',
    rating: 5,
    date: '2025-12-03',
    text: 'Best bulk gravel delivery I have had on CivicBuild. Driver called 30 minutes ahead and quantity was spot on.',
    orderNumber: 'CB-09503',
  },
];

export function getMyReviewsSummary(
  reviews: UserWrittenReview[] = MOCK_USER_REVIEWS,
): MyReviewsSummary {
  const productCount = reviews.filter((review) => review.type === 'product').length;
  const supplierCount = reviews.filter((review) => review.type === 'supplier').length;
  const averageRatingGiven =
    reviews.length === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10,
        ) / 10;

  return {
    totalCount: reviews.length,
    productCount,
    supplierCount,
    averageRatingGiven,
    reviews: [...reviews].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
