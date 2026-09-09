import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Customer } from '../models';
import { MOCK_CUSTOMERS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { OrderService } from './order.service';

export interface CustomerSummary extends Customer {
  orderCount: number;
  totalSpent: number;
}

/** Admin-facing customer directory. Shares the same localStorage bucket as AuthService. */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly _customers = signal<Customer[]>([]);
  readonly customers = this._customers.asReadonly();

  constructor(private storage: StorageService, private orderSvc: OrderService) {
    this.storage.seed(STORAGE_KEYS.customers, MOCK_CUSTOMERS);
    this._customers.set(this.storage.get<Customer[]>(STORAGE_KEYS.customers, MOCK_CUSTOMERS));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.customers, this._customers());
  }

  getAllWithStats(): Observable<CustomerSummary[]> {
    const orders = this.orderSvc.orders();
    const summaries = this._customers().map((c) => {
      const customerOrders = orders.filter((o) => o.customerId === c.id);
      return {
        ...c,
        orderCount: customerOrders.length,
        totalSpent: +customerOrders.reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2),
      };
    });
    return of(summaries).pipe(delay(120));
  }

  getById(id: string): Customer | undefined {
    return this._customers().find((c) => c.id === id);
  }

  toggleStatus(id: string): void {
    this._customers.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
    this.persist();
  }
}
