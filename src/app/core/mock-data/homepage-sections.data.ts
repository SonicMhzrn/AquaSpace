import { HomepageSection } from '../models';

export const MOCK_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 'sec-hero', type: 'hero', title: 'Dive Into Your Perfect Aquarium', subtitle: 'Everything your aquatic world needs.', enabled: true, displayOrder: 1 },
  { id: 'sec-categories', type: 'categories', title: 'Shop by Category', enabled: true, displayOrder: 2 },
  { id: 'sec-featured', type: 'featured-products', title: 'Featured Products', enabled: true, displayOrder: 3 },
  { id: 'sec-new-arrivals', type: 'new-arrivals', title: 'New Arrivals', enabled: true, displayOrder: 4 },
  { id: 'sec-promo', type: 'promotion', title: 'Winter Water-Quality Sale', subtitle: 'Up to 20% off filtration', enabled: true, displayOrder: 5 },
  { id: 'sec-best-sellers', type: 'best-sellers', title: 'Best Sellers', enabled: true, displayOrder: 6 },
  { id: 'sec-why-us', type: 'why-us', title: 'Why Choose AquaShop', enabled: true, displayOrder: 7 },
  { id: 'sec-reviews', type: 'reviews', title: 'What Aquarists Are Saying', enabled: true, displayOrder: 8 },
  { id: 'sec-blog', type: 'blog', title: 'From the Fish Care Library', enabled: true, displayOrder: 9 },
  { id: 'sec-newsletter', type: 'newsletter', title: 'Stay in the Current', subtitle: 'Tips, offers, and new arrivals in your inbox.', enabled: true, displayOrder: 10 },
];
