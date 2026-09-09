import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  readonly totalProducts = computed(() => this.productSvc.products().length);
  readonly totalCategories = computed(() => this.categorySvc.categories().length);
  readonly totalOrders = computed(() => this.orderSvc.orders().length);
  readonly totalCustomers = computed(() => this.customerSvc.customers().length);
  readonly totalRevenue = computed(() => +this.orderSvc.orders().reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2));

  readonly recentOrders = computed(() =>
    [...this.orderSvc.orders()].sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)).slice(0, 5)
  );
  readonly recentCustomers = computed(() =>
    [...this.customerSvc.customers()].sort((a, b) => +new Date(b.registeredAt) - +new Date(a.registeredAt)).slice(0, 5)
  );
  readonly bestSellers = computed(() => this.productSvc.bestSellers().slice(0, 5));

  readonly lowStock = computed(() => this.inventorySvc.rows().filter((r) => r.status === 'Low Stock').slice(0, 6));
  readonly outOfStock = computed(() => this.inventorySvc.rows().filter((r) => r.status === 'Out of Stock').slice(0, 6));

  // Simple 7-point mock sales trend derived from order totals, for a lightweight chart without extra deps.
  readonly salesTrend = computed(() => {
    const orders = [...this.orderSvc.orders()].sort((a, b) => +new Date(a.placedAt) - +new Date(b.placedAt));
    const points = orders.slice(-7).map((o) => o.grandTotal);
    while (points.length < 7) points.unshift(0);
    return points;
  });
  readonly maxTrendValue = computed(() => Math.max(...this.salesTrend(), 1));

  constructor(
    private productSvc: ProductService,
    private categorySvc: CategoryService,
    private orderSvc: OrderService,
    private customerSvc: CustomerService,
    public inventorySvc: InventoryService
  ) {}
}
