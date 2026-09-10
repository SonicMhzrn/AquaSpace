export type HomepageSectionType =
  | 'hero'
  | 'categories'
  | 'featured-products'
  | 'best-sellers'
  | 'new-arrivals'
  | 'promotion'
  | 'blog'
  | 'reviews'
  | 'newsletter'
  | 'why-us';

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  active: boolean;
  displayOrder: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  couponCode?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: string[];
  categoryIds: string[];
  type: 'flash-sale' | 'seasonal' | 'bundle' | 'coupon';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  category: string;
  author: string;
  publishedDate: string;
  status: 'Published' | 'Draft';
  tags: string[];
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  avatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  shippingFee: number;
  freeShippingThreshold: number;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  reviewsEnabled: boolean;
  wishlistEnabled: boolean;
}
