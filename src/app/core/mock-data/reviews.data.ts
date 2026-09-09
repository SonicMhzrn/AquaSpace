import { Review } from '../models';

export const MOCK_REVIEWS: Review[] = [
  { id: 'rev-1', productId: 'p-neon-tetra', customerName: 'Jordan P.', rating: 5, title: 'So vibrant!', comment: 'Arrived healthy and active, color is even better than the photos.', createdAt: '2026-02-01', verifiedPurchase: true },
  { id: 'rev-2', productId: 'p-neon-tetra', customerName: 'Sam K.', rating: 4, title: 'Great schooling fish', comment: 'Lost one in transit but the rest are thriving two months later.', createdAt: '2026-01-18', verifiedPurchase: true },
  { id: 'rev-3', productId: 'p-betta-fish', customerName: 'Alicia R.', rating: 5, title: 'Gorgeous fins', comment: 'My betta has the most incredible color, very active eater.', createdAt: '2026-02-10', verifiedPurchase: true },
  { id: 'rev-4', productId: 'p-starter-kit-20', customerName: 'Devon M.', rating: 5, title: 'Perfect first tank', comment: 'Everything I needed in one box, filter is much quieter than expected.', createdAt: '2026-01-25', verifiedPurchase: true },
  { id: 'rev-5', productId: 'p-starter-kit-20', customerName: 'Taylor S.', rating: 4, title: 'Good value', comment: 'Light is a bit dim for a planted tank but great for fish only.', createdAt: '2026-02-05', verifiedPurchase: false },
  { id: 'rev-6', productId: 'p-java-fern', customerName: 'Morgan L.', rating: 5, title: 'Thriving after a month', comment: 'Attached it to driftwood and it took root beautifully, zero issues.', createdAt: '2026-02-12', verifiedPurchase: true },
  { id: 'rev-7', productId: 'p-canister-filter', customerName: 'Chris B.', rating: 5, title: 'Powerful and quiet', comment: 'Water clarity improved within two days, barely hear it running.', createdAt: '2026-01-30', verifiedPurchase: true },
  { id: 'rev-8', productId: 'p-led-light', customerName: 'Riley T.', rating: 5, title: 'Plants love it', comment: 'Noticeable new growth within a week of switching to this light.', createdAt: '2026-02-14', verifiedPurchase: true },
  { id: 'rev-9', productId: 'p-water-conditioner', customerName: 'Jamie F.', rating: 5, title: 'Always in my cart', comment: 'Been using this brand for years, never had an issue with tap water.', createdAt: '2026-02-08', verifiedPurchase: true },
  { id: 'rev-10', productId: 'p-test-kit', customerName: 'Casey W.', rating: 5, title: 'Essential purchase', comment: 'Way more accurate than strips, lasts a very long time.', createdAt: '2026-01-22', verifiedPurchase: true },
  { id: 'rev-11', productId: 'p-aquarium-heater', customerName: 'Drew H.', rating: 4, title: 'Holds temperature well', comment: 'Steady at 78 degrees for weeks now, dial could be a bit more precise.', createdAt: '2026-02-03', verifiedPurchase: true },
  { id: 'rev-12', productId: 'p-angelfish', customerName: 'Quinn A.', rating: 5, title: 'Beautiful centerpiece fish', comment: 'Graceful and calm, gets along great with my tetras.', createdAt: '2026-02-16', verifiedPurchase: true },
];
