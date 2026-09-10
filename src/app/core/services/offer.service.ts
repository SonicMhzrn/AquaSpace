import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Offer } from '../models';
import { MOCK_OFFERS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly _offers = signal<Offer[]>([]);
  readonly offers = this._offers.asReadonly();
  readonly activeOffers = computed(() => this._offers().filter((o) => o.active));

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.offers, MOCK_OFFERS);
    this._offers.set(this.storage.get<Offer[]>(STORAGE_KEYS.offers, MOCK_OFFERS));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.offers, this._offers());
  }

  getAll(): Observable<Offer[]> {
    return of(this._offers()).pipe(delay(100));
  }

  validateCoupon(code: string): Offer | undefined {
    return this.activeOffers().find((o) => o.type === 'coupon' && o.couponCode?.toLowerCase() === code.toLowerCase());
  }

  create(offer: Offer): void {
    this._offers.update((list) => [...list, offer]);
    this.persist();
  }

  update(id: string, changes: Partial<Offer>): void {
    this._offers.update((list) => list.map((o) => (o.id === id ? { ...o, ...changes } : o)));
    this.persist();
  }

  delete(id: string): void {
    this._offers.update((list) => list.filter((o) => o.id !== id));
    this.persist();
  }

  toggleActive(id: string): void {
    this._offers.update((list) => list.map((o) => (o.id === id ? { ...o, active: !o.active } : o)));
    this.persist();
  }
}
