import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  order?: Order;
  readonly statusFlow = STATUS_FLOW;

  constructor(private route: ActivatedRoute, private orderSvc: OrderService, private seo: SeoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.order = this.orderSvc.getById(id);
    this.seo.update(this.order ? `Order ${this.order.orderNumber}` : 'Order Not Found');
  }

  get currentStepIndex(): number {
    if (!this.order) return -1;
    return this.statusFlow.indexOf(this.order.status);
  }

  get isCancelled(): boolean {
    return this.order?.status === 'Cancelled';
  }
}
