import { Banner } from '../models';

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'ban-1', title: 'Dive Into Your Perfect Aquarium', subtitle: 'Premium fish, tanks & gear',
    description: 'Everything your aquatic world needs, curated for beginners and experts alike.',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1600&q=80',
    buttonText: 'Shop Fish', buttonLink: '/category/fish',
    startDate: '2026-01-01', endDate: '2026-12-31', active: true, displayOrder: 1,
  },
  {
    id: 'ban-2', title: 'Starter Kits, Ready to Launch', subtitle: 'Everything in one box',
    description: 'Tank, filter, light, and conditioner — set up your first aquarium in an afternoon.',
    image: 'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=1600&q=80',
    buttonText: 'Explore Kits', buttonLink: '/category/aquarium-tanks',
    startDate: '2026-01-01', endDate: '2026-12-31', active: true, displayOrder: 2,
  },
  {
    id: 'ban-3', title: 'Live Plants, Instant Aquascape', subtitle: 'Low-light & beginner friendly',
    description: 'Java Fern, Anubias, and Amazon Sword ready to root in your tank this week.',
    image: 'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=1600&q=80',
    buttonText: 'Shop Plants', buttonLink: '/category/aquarium-plants',
    startDate: '2026-01-01', endDate: '2026-12-31', active: true, displayOrder: 3,
  },
  {
    id: 'ban-4', title: 'Winter Water-Quality Sale', subtitle: 'Up to 20% off filtration',
    description: 'Keep your tank crystal clear with discounted filters and conditioners this month.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=80',
    buttonText: 'View Offers', buttonLink: '/offers',
    startDate: '2026-01-01', endDate: '2026-03-31', active: true, displayOrder: 4,
  },
  {
    id: 'ban-5', title: 'New: Fish Care Library', subtitle: 'Learn before you buy',
    description: 'Guides on cycling, compatibility, and water quality from our in-house aquarists.',
    image: 'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=1600&q=80',
    buttonText: 'Read Guides', buttonLink: '/fish-care',
    startDate: '2026-01-01', endDate: '2026-12-31', active: true, displayOrder: 5,
  },
];
