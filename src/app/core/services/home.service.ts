import { Injectable, computed, signal } from '@angular/core';
import { HomepageSection } from '../models';
import { MOCK_HOMEPAGE_SECTIONS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { BannerService } from './banner.service';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { ReviewService } from './review.service';
import { BlogService } from './blog.service';

/**
 * Drives homepage layout. Admin toggles/reorders sections here; the
 * homepage component simply iterates `enabledSections` in order.
 */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly _sections = signal<HomepageSection[]>([]);
  readonly sections = this._sections.asReadonly();
  readonly enabledSections = computed(() =>
    [...this._sections()].filter((s) => s.enabled).sort((a, b) => a.displayOrder - b.displayOrder)
  );

  constructor(
    private storage: StorageService,
    public banners: BannerService,
    public products: ProductService,
    public categories: CategoryService,
    public reviews: ReviewService,
    public blog: BlogService
  ) {
    this.storage.seed(STORAGE_KEYS.homepageSections, MOCK_HOMEPAGE_SECTIONS);
    const stored = this.storage.get<HomepageSection[]>(STORAGE_KEYS.homepageSections, MOCK_HOMEPAGE_SECTIONS);
    // Backfill any sections missing from cached data (e.g. predates a newer section type).
    const missing = MOCK_HOMEPAGE_SECTIONS.filter((def) => !stored.some((s) => s.id === def.id));
    this._sections.set([...stored, ...missing]);
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.homepageSections, this._sections());
  }

  update(id: string, changes: Partial<HomepageSection>): void {
    this._sections.update((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
    this.persist();
  }

  reorder(orderedIds: string[]): void {
    this._sections.update((list) =>
      list.map((s) => ({ ...s, displayOrder: orderedIds.indexOf(s.id) + 1 }))
    );
    this.persist();
  }

  toggleEnabled(id: string): void {
    this._sections.update((list) => list.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    this.persist();
  }
}
