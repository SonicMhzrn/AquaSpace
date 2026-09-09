import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Category } from '../models';
import { MOCK_CATEGORIES } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

/**
 * Loads categories from localStorage (seeded from mock data on first run).
 * When the .NET API lands, replace the `of(...)` bodies with
 * `this.http.get<Category[]>('/categories')` — components consuming the
 * signals below won't need to change.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();

  readonly activeCategories = computed(() => this._categories().filter((c) => c.isActive));
  readonly topLevelCategories = computed(() =>
    this.activeCategories()
      .filter((c) => !c.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  );
  readonly featuredCategories = computed(() =>
    this.activeCategories()
      .filter((c) => c.isFeatured)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  );

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.categories, MOCK_CATEGORIES);
    this._categories.set(this.storage.get<Category[]>(STORAGE_KEYS.categories, MOCK_CATEGORIES));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.categories, this._categories());
  }

  getAll(): Observable<Category[]> {
    return of(this._categories()).pipe(delay(120));
  }

  getBySlug(slug: string): Category | undefined {
    return this._categories().find((c) => c.slug === slug);
  }

  getById(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }

  getSubcategories(parentId: string): Category[] {
    return this.activeCategories()
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /** Includes the category itself plus any subcategory ids — used to filter products under a parent like Accessories. */
  getCategoryAndDescendantIds(categoryId: string): string[] {
    const children = this._categories().filter((c) => c.parentId === categoryId).map((c) => c.id);
    return [categoryId, ...children];
  }

  create(category: Category): void {
    this._categories.update((list) => [...list, category]);
    this.persist();
  }

  update(id: string, changes: Partial<Category>): void {
    this._categories.update((list) => list.map((c) => (c.id === id ? { ...c, ...changes } : c)));
    this.persist();
  }

  delete(id: string): void {
    this._categories.update((list) => list.filter((c) => c.id !== id && c.parentId !== id));
    this.persist();
  }

  toggleActive(id: string): void {
    this._categories.update((list) => list.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    this.persist();
  }
}
