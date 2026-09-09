import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly itemCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));

  constructor(private storage: StorageService, private productSvc: ProductService) {
    this._items.set(this.storage.get<CartItem[]>(STORAGE_KEYS.cart, []));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.cart, this._items());
  }

  add(productId: string, quantity = 1): { ok: boolean; message?: string } {
    const product = this.productSvc.getById(productId);
    if (!product) return { ok: false, message: 'Product not found.' };

    const existing = this._items().find((i) => i.productId === productId);
    const desiredQty = (existing?.quantity ?? 0) + quantity;

    if (product.trackInventory && !product.allowBackorders && desiredQty > product.stockQuantity) {
      return { ok: false, message: `Only ${product.stockQuantity} left in stock.` };
    }

    if (existing) {
      this._items.update((list) => list.map((i) => (i.productId === productId ? { ...i, quantity: desiredQty } : i)));
    } else {
      this._items.update((list) => [
        ...list,
        {
          productId: product.id,
          name: product.name,
          image: product.images[0] ?? '',
          unitPrice: product.salePrice ?? product.price,
          quantity,
          maxQuantity: product.trackInventory ? product.stockQuantity : 999,
          sku: product.sku,
        },
      ]);
    }
    this.persist();
    return { ok: true };
  }

  updateQuantity(productId: string, quantity: number): { ok: boolean; message?: string } {
    const product = this.productSvc.getById(productId);
    if (product?.trackInventory && !product.allowBackorders && quantity > product.stockQuantity) {
      return { ok: false, message: `Only ${product.stockQuantity} left in stock.` };
    }
    if (quantity <= 0) {
      this.remove(productId);
      return { ok: true };
    }
    this._items.update((list) => list.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
    this.persist();
    return { ok: true };
  }

  remove(productId: string): void {
    this._items.update((list) => list.filter((i) => i.productId !== productId));
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }
}
