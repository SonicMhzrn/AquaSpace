import { Offer } from '../models';

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'off-1', title: 'Starter Kit Flash Sale', description: '20% off all-in-one aquarium starter kits this week only.',
    discountPercent: 20, startDate: '2026-09-01', endDate: '2026-09-30', active: true,
    productIds: ['p-starter-kit-20'], categoryIds: [], type: 'flash-sale',
  },
  {
    id: 'off-2', title: 'Lighting Upgrade Sale', description: 'Save on full-spectrum LED lighting for planted tanks.',
    discountPercent: 18, startDate: '2026-09-01', endDate: '2026-10-15', active: true,
    productIds: ['p-led-light'], categoryIds: [], type: 'seasonal',
  },
  {
    id: 'off-3', title: 'Fish Care Essentials Bundle', description: 'Bundle a test kit, conditioner, and stress coat for one low price.',
    discountPercent: 15, startDate: '2026-08-15', endDate: '2026-12-01', active: true,
    productIds: ['p-test-kit', 'p-water-conditioner', 'p-stress-coat'], categoryIds: [], type: 'bundle',
  },
  {
    id: 'off-4', title: 'Welcome Coupon', description: 'New customers save 10% on their first order with code AQUA10.',
    discountPercent: 10, couponCode: 'AQUA10', startDate: '2026-01-01', endDate: '2026-12-31', active: true,
    productIds: [], categoryIds: [], type: 'coupon',
  },
  {
    id: 'off-5', title: 'Plant Lovers Sale', description: 'Discounts across live aquarium plants for a lush aquascape.',
    discountPercent: 12, startDate: '2026-09-01', endDate: '2026-09-20', active: true,
    productIds: [], categoryIds: ['cat-plants'], type: 'seasonal',
  },
];
