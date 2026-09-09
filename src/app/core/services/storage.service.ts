import { Injectable } from '@angular/core';

/**
 * Central gateway to localStorage. No other service or component should
 * call localStorage directly — this keeps persistence swappable (e.g. for
 * a future server-backed session) and testable.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'aquashop:';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private browsing, quota) — fail silently
      // so the app keeps working in-memory for the session.
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /** Seeds a key with initial data only if it doesn't already exist. */
  seed<T>(key: string, initial: T): void {
    if (!this.has(key)) {
      this.set(key, initial);
    }
  }

  clearAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k));
  }
}

export const STORAGE_KEYS = {
  cart: 'cart',
  wishlist: 'wishlist',
  customers: 'customers',
  session: 'session',
  orders: 'orders',
  products: 'products',
  categories: 'categories',
  inventoryLog: 'inventory-log',
  settings: 'settings',
  banners: 'banners',
  offers: 'offers',
  blogPosts: 'blog-posts',
  reviews: 'reviews',
  homepageSections: 'homepage-sections',
} as const;
