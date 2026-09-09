import { Injectable, computed } from '@angular/core';
import { Product, StockStatus } from '../models';
import { ProductService } from './product.service';

export interface InventoryRow {
  product: Product;
  status: StockStatus;
}

/** Thin, derived view over ProductService for the admin inventory screen — no duplicate source of truth. */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private productSvc: ProductService) {}

  readonly rows = computed<InventoryRow[]>(() =>
    this.productSvc.products().map((p) => ({ product: p, status: ProductService.computeStockStatus(p) }))
  );

  readonly lowStockCount = computed(() => this.rows().filter((r) => r.status === 'Low Stock').length);
  readonly outOfStockCount = computed(() => this.rows().filter((r) => r.status === 'Out of Stock').length);

  adjustStock(productId: string, quantity: number): void {
    this.productSvc.adjustStock(productId, quantity);
  }

  setMinimumStock(productId: string, minimumStock: number): void {
    this.productSvc.update(productId, { minimumStock });
  }
}
