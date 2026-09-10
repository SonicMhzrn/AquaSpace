import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Product } from '../models';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';

export interface SearchSuggestion {
  type: 'product' | 'category';
  label: string;
  routerLink: string[];
  image?: string;
}

/** Powers the global header search dropdown: product + category suggestions, and full results. */
@Injectable({ providedIn: 'root' })
export class ProductSearchService {
  private readonly _query = signal('');
  readonly query = this._query.asReadonly();

  readonly suggestions = computed<SearchSuggestion[]>(() => {
    const q = this._query().toLowerCase().trim();
    if (!q) return [];

    const categoryMatches: SearchSuggestion[] = this.categorySvc
      .activeCategories()
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ type: 'category', label: c.name, routerLink: ['/category', c.slug], image: c.image }));

    const productMatches: SearchSuggestion[] = this.productSvc
      .activeProducts()
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({ type: 'product', label: p.name, routerLink: ['/product', p.id], image: p.images[0] }));

    return [...categoryMatches, ...productMatches];
  });

  constructor(private productSvc: ProductService, private categorySvc: CategoryService) {}

  setQuery(q: string): void {
    this._query.set(q);
  }

  searchFull(q: string): Observable<Product[]> {
    return this.productSvc.search({ search: q }).pipe(delay(0));
  }
}
