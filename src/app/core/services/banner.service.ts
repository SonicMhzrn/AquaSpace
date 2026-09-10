import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Banner } from '../models';
import { MOCK_BANNERS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly _banners = signal<Banner[]>([]);
  readonly banners = this._banners.asReadonly();
  readonly activeBanners = computed(() =>
    [...this._banners()].filter((b) => b.active).sort((a, b) => a.displayOrder - b.displayOrder)
  );

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.banners, MOCK_BANNERS);
    const stored = this.storage.get<Banner[]>(STORAGE_KEYS.banners, MOCK_BANNERS);
    // Backfill any banners missing from cached data (e.g. predates a newer banner).
    const missing = MOCK_BANNERS.filter((def) => !stored.some((b) => b.id === def.id));
    this._banners.set([...stored, ...missing]);
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.banners, this._banners());
  }

  getAll(): Observable<Banner[]> {
    return of(this._banners()).pipe(delay(100));
  }

  create(banner: Banner): void {
    this._banners.update((list) => [...list, banner]);
    this.persist();
  }

  update(id: string, changes: Partial<Banner>): void {
    this._banners.update((list) => list.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    this.persist();
  }

  delete(id: string): void {
    this._banners.update((list) => list.filter((b) => b.id !== id));
    this.persist();
  }

  toggleActive(id: string): void {
    this._banners.update((list) => list.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
    this.persist();
  }
}
