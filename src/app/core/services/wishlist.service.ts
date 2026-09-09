import { Injectable, computed, signal } from '@angular/core';
import { WishlistItem } from '../models';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { ProductService } from './product.service';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _items = signal<WishlistItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  constructor(private storage: StorageService, private productSvc: ProductService, private cartSvc: CartService) {
    this._items.set(this.storage.get<WishlistItem[]>(STORAGE_KEYS.wishlist, []));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.wishlist, this._items());
  }

  isWishlisted(productId: string): boolean {
    return this._items().some((i) => i.productId === productId);
  }

  toggle(productId: string): void {
    if (this.isWishlisted(productId)) {
      this.remove(productId);
      return;
    }
    const product = this.productSvc.getById(productId);
    if (!product) return;
    this._items.update((list) => [
      ...list,
      { productId: product.id, name: product.name, image: product.images[0] ?? '', price: product.salePrice ?? product.price, addedAt: new Date().toISOString() },
    ]);
    this.persist();
  }

  remove(productId: string): void {
    this._items.update((list) => list.filter((i) => i.productId !== productId));
    this.persist();
  }

  moveToCart(productId: string): void {
    this.cartSvc.add(productId, 1);
    this.remove(productId);
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }
}
