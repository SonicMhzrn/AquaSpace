import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { StoreSettings } from '../models';
import { MOCK_SETTINGS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = signal<StoreSettings>(MOCK_SETTINGS);
  readonly settings = this._settings.asReadonly();

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.settings, MOCK_SETTINGS);
    const stored = this.storage.get<StoreSettings>(STORAGE_KEYS.settings, MOCK_SETTINGS);
    // Merge with defaults in case cached data predates newer fields (e.g. socialLinks).
    this._settings.set({ ...MOCK_SETTINGS, ...stored, socialLinks: { ...MOCK_SETTINGS.socialLinks, ...stored?.socialLinks } });
  }

  get(): Observable<StoreSettings> {
    return of(this._settings()).pipe(delay(80));
  }

  update(changes: Partial<StoreSettings>): void {
    this._settings.update((s) => ({ ...s, ...changes }));
    this.storage.set(STORAGE_KEYS.settings, this._settings());
  }
}
