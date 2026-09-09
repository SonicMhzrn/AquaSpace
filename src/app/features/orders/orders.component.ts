import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { SeoService } from '../../core/services/seo.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  constructor(public orderSvc: OrderService, private seo: SeoService) {
    this.seo.update('My Orders', 'Track and review your AquaShop order history.');
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
