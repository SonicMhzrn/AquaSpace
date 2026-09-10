import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product, ProductFilterOptions, StockStatus } from '../models';
import { MOCK_PRODUCTS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { CategoryService } from './category.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  /** Only active products should ever reach customer-facing views. */
  readonly activeProducts = computed(() => this._products().filter((p) => p.isActive));
  readonly featuredProducts = computed(() => this.activeProducts().filter((p) => p.isFeatured));
  readonly bestSellers = computed(() =>
    [...this.activeProducts()].filter((p) => p.badges.includes('BEST SELLER')).sort((a, b) => b.rating.count - a.rating.count)
  );
  readonly newArrivals = computed(() =>
    [...this.activeProducts()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8)
  );

  constructor(private storage: StorageService, private categorySvc: CategoryService) {
    this.storage.seed(STORAGE_KEYS.products, MOCK_PRODUCTS);
    const stored = this.storage.get<Product[]>(STORAGE_KEYS.products, MOCK_PRODUCTS);
    // Guard against cached data that predates newer fields (e.g. badges, seo).
    this._products.set(
      stored.map((p) => ({
        ...p,
        badges: p.badges ?? [],
        tags: p.tags ?? [],
        seo: p.seo ?? { metaTitle: p.name, metaDescription: p.shortDescription ?? '' },
      }))
    );
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.products, this._products());
  }

  static computeStockStatus(product: Pick<Product, 'stockQuantity' | 'minimumStock'>): StockStatus {
    if (product.stockQuantity <= 0) return 'Out of Stock';
    if (product.stockQuantity <= product.minimumStock) return 'Low Stock';
    return 'In Stock';
  }

  getAll(): Observable<Product[]> {
    return of(this.activeProducts()).pipe(delay(150));
  }

  /** Includes inactive products too — used by the admin product list. */
  getAllForAdmin(): Observable<Product[]> {
    return of(this._products()).pipe(delay(100));
  }

  getById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return this._products().find((p) => p.slug === slug);
  }

  getRelated(product: Product, limit = 4): Product[] {
    return this.activeProducts()
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
      .slice(0, limit);
  }

  /**
   * Filters + sorts active products. `categorySlug` matches both a primary
   * category (Fish, Fish Food) and a nested Accessories subcategory, and
   * also expands a parent category to include all its children.
   */
  search(options: ProductFilterOptions): Observable<Product[]> {
    let result = this.activeProducts();

    if (options.categorySlug) {
      const category = this.categorySvc.getBySlug(options.categorySlug);
      if (category) {
        const ids = this.categorySvc.getCategoryAndDescendantIds(category.id);
        result = result.filter((p) => ids.includes(p.categoryId) || (p.subcategoryId ? ids.includes(p.subcategoryId) : false));
      }
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options.minPrice !== undefined) {
      result = result.filter((p) => (p.salePrice ?? p.price) >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      result = result.filter((p) => (p.salePrice ?? p.price) <= options.maxPrice!);
    }
    if (options.brands?.length) {
      result = result.filter((p) => options.brands!.includes(p.brand));
    }
    if (options.minRating !== undefined) {
      result = result.filter((p) => p.rating.average >= options.minRating!);
    }
    if (options.inStockOnly) {
      result = result.filter((p) => p.stockQuantity > 0);
    }

    switch (options.sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'newest':
        result = [...result].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case 'popular':
        result = [...result].sort((a, b) => b.rating.count - a.rating.count);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating.average - a.rating.average);
        break;
    }

    return of(result).pipe(delay(150));
  }

  getBrandsForCategory(categorySlug?: string): string[] {
    let list = this.activeProducts();
    if (categorySlug) {
      const category = this.categorySvc.getBySlug(categorySlug);
      if (category) {
        const ids = this.categorySvc.getCategoryAndDescendantIds(category.id);
        list = list.filter((p) => ids.includes(p.categoryId) || (p.subcategoryId ? ids.includes(p.subcategoryId) : false));
      }
    }
    return [...new Set(list.map((p) => p.brand))].sort();
  }

  // ── Admin CRUD — writes here flow straight through the shared signal, so
  // every customer-facing computed() (activeProducts, featured, etc.) and
  // any component reading them updates immediately. No refresh needed. ──

  create(product: Product): void {
    this._products.update((list) => [product, ...list]);
    this.persist();
  }

  update(id: string, changes: Partial<Product>): void {
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
    this.persist();
  }

  delete(id: string): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  toggleActive(id: string): void {
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    this.persist();
  }

  duplicate(id: string): void {
    const source = this.getById(id);
    if (!source) return;
    const copy: Product = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      sku: `${source.sku}-COPY`,
      slug: `${source.slug}-copy-${Date.now()}`,
      name: `${source.name} (Copy)`,
      isFeatured: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    this.create(copy);
  }

  /** Decrements stock after a mock checkout; never drops below zero. */
  decrementStock(productId: string, quantity: number): void {
    this._products.update((list) =>
      list.map((p) => (p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - quantity) } : p))
    );
    this.persist();
  }

  adjustStock(productId: string, newQuantity: number): void {
    this._products.update((list) => list.map((p) => (p.id === productId ? { ...p, stockQuantity: Math.max(0, newQuantity) } : p)));
    this.persist();
  }
}
