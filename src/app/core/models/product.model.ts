/**
 * A single flexible product attribute (e.g. "Water Temperature" -> "72-78°F").
 * This keeps the product model open-ended instead of hardcoding every
 * possible field for every product type (fish vs. food vs. hardware).
 */
export interface ProductAttribute {
  label: string;
  value: string;
}

export type ProductBadge = 'NEW' | 'SALE' | 'BEST SELLER' | 'LOW STOCK';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface ProductReviewSummary {
  average: number;
  count: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  costPrice?: number;
  currency: string;
  stockQuantity: number;
  minimumStock: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  rating: ProductReviewSummary;
  attributes: ProductAttribute[];
  specifications: ProductAttribute[];
  tags: string[];
  badges: ProductBadge[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ProductFilterOptions {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
}
