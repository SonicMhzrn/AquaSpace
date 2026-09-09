import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Review } from '../models';
import { MOCK_REVIEWS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly _reviews = signal<Review[]>([]);
  readonly reviews = this._reviews.asReadonly();

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.reviews, MOCK_REVIEWS);
    this._reviews.set(this.storage.get<Review[]>(STORAGE_KEYS.reviews, MOCK_REVIEWS));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.reviews, this._reviews());
  }

  getAll(): Observable<Review[]> {
    return of(this._reviews()).pipe(delay(100));
  }

  getForProduct(productId: string): Review[] {
    return this._reviews()
      .filter((r) => r.productId === productId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  add(review: Review): void {
    this._reviews.update((list) => [review, ...list]);
    this.persist();
  }

  delete(id: string): void {
    this._reviews.update((list) => list.filter((r) => r.id !== id));
    this.persist();
  }
}
