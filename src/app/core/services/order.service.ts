import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Address, DeliveryMethod, Order, OrderItem, OrderStatus, PaymentMethod } from '../models';
import { MOCK_ORDERS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { ProductService } from './product.service';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';

export interface PlaceOrderPayload {
  billingAddress: Address;
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  discount?: number;
  shippingFee: number;
  taxRatePercent: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  constructor(
    private storage: StorageService,
    private productSvc: ProductService,
    private cartSvc: CartService,
    private authSvc: AuthService
  ) {
    this.storage.seed(STORAGE_KEYS.orders, MOCK_ORDERS);
    this._orders.set(this.storage.get<Order[]>(STORAGE_KEYS.orders, MOCK_ORDERS));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.orders, this._orders());
  }

  getAll(): Observable<Order[]> {
    return of(this._orders()).pipe(delay(120));
  }

  getMyOrders(): Order[] {
    const session = this.authSvc.session();
    if (!session) return [];
    return this._orders()
      .filter((o) => o.customerId === session.customerId)
      .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt));
  }

  getById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  getByOrderNumber(orderNumber: string): Order | undefined {
    return this._orders().find((o) => o.orderNumber === orderNumber);
  }

  placeOrder(payload: PlaceOrderPayload): Order {
    const session = this.authSvc.session();
    const items: OrderItem[] = this.cartSvc.items().map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.unitPrice * i.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const discount = payload.discount ?? 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = +(taxableAmount * (payload.taxRatePercent / 100)).toFixed(2);
    const grandTotal = +(taxableAmount + tax + payload.shippingFee).toFixed(2);

    const now = new Date();
    const estimated = new Date(now);
    estimated.setDate(estimated.getDate() + (payload.deliveryMethod === 'Express Delivery' ? 2 : payload.deliveryMethod === 'Store Pickup' ? 1 : 6));

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `AQ-${Math.floor(100000 + Math.random() * 899999)}`,
      customerId: session?.customerId ?? 'guest',
      customerName: `${payload.billingAddress.fullName}`,
      customerEmail: session?.email ?? '',
      items,
      billingAddress: payload.billingAddress,
      shippingAddress: payload.shippingAddress,
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Paid',
      status: 'Pending',
      subtotal: +subtotal.toFixed(2),
      discount,
      shippingFee: payload.shippingFee,
      tax,
      grandTotal,
      couponCode: payload.couponCode,
      placedAt: now.toISOString(),
      estimatedDelivery: estimated.toISOString().slice(0, 10),
    };

    this._orders.update((list) => [order, ...list]);
    this.persist();

    // Reflect purchase in inventory immediately.
    items.forEach((i) => this.productSvc.decrementStock(i.productId, i.quantity));
    this.cartSvc.clear();

    return order;
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this._orders.update((list) => list.map((o) => (o.id === orderId ? { ...o, status } : o)));
    this.persist();
  }
}
