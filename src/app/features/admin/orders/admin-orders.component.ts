import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../shared/services/toast.service';

const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent {
  readonly statuses = STATUSES;
  search = signal('');
  statusFilter = signal<OrderStatus | 'all'>('all');
  expandedId = signal<string | null>(null);

  readonly filtered = computed<Order[]>(() => {
    const q = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    return [...this.orderSvc.orders()]
      .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
      .filter((o) => {
        const matchesQuery = !q || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
        const matchesStatus = status === 'all' || o.status === status;
        return matchesQuery && matchesStatus;
      });
  });

  constructor(public orderSvc: OrderService, private toast: ToastService) {}

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderSvc.updateStatus(order.id, status);
    this.toast.success(`Order ${order.orderNumber} marked as ${status}`);
  }

  statusClasses(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-slate-100 text-slate-600',
      Confirmed: 'bg-blue-50 text-blue-600',
      Processing: 'bg-amber-50 text-amber-700',
      Packed: 'bg-purple-50 text-purple-600',
      Shipped: 'bg-tide-50 text-tide-700',
      Delivered: 'bg-green-50 text-green-700',
      Cancelled: 'bg-red-50 text-red-600',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
