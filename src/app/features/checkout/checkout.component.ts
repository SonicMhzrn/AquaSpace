import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DeliveryMethod, Order, PaymentMethod } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { SettingsService } from '../../core/services/settings.service';
import { OfferService } from '../../core/services/offer.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  step = signal<'details' | 'confirmation'>('details');
  placedOrder = signal<Order | null>(null);
  couponCode = '';
  appliedDiscount = 0;
  appliedCode?: string;

  deliveryMethods: DeliveryMethod[] = ['Standard Delivery', 'Express Delivery', 'Store Pickup'];
  paymentMethods: PaymentMethod[] = ['Cash on Delivery', 'Credit/Debit Card', 'Online Payment', 'Digital Wallet'];

  private fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private settingsSvc = inject(SettingsService);

  readonly settings = this.settingsSvc.settings;

  form = this.fb.nonNullable.group({
    fullName: [this.customerFullName(), Validators.required],
    email: [this.authSvc.session()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.authSvc.getCurrentCustomer()?.phone ?? '', Validators.required],
    addressLine: [this.authSvc.getCurrentCustomer()?.addresses[0]?.addressLine ?? '', Validators.required],
    city: [this.authSvc.getCurrentCustomer()?.addresses[0]?.city ?? '', Validators.required],
    state: [this.authSvc.getCurrentCustomer()?.addresses[0]?.state ?? '', Validators.required],
    country: [this.authSvc.getCurrentCustomer()?.addresses[0]?.country ?? '', Validators.required],
    postalCode: [this.authSvc.getCurrentCustomer()?.addresses[0]?.postalCode ?? '', Validators.required],
    shipToDifferentAddress: [false],
    shipFullName: [''],
    shipAddressLine: [''],
    shipCity: [''],
    shipState: [''],
    shipCountry: [''],
    shipPostalCode: [''],
    deliveryMethod: ['Standard Delivery' as DeliveryMethod, Validators.required],
    paymentMethod: ['Cash on Delivery' as PaymentMethod, Validators.required],
  });

  readonly shippingFee = computed(() => {
    const subtotal = this.cartSvc.subtotal();
    const method = this.form.controls.deliveryMethod.value;
    if (method === 'Store Pickup') return 0;
    if (subtotal >= this.settings().freeShippingThreshold) return 0;
    return method === 'Express Delivery' ? this.settings().shippingFee + 8 : this.settings().shippingFee;
  });
  readonly taxableAmount = computed(() => Math.max(0, this.cartSvc.subtotal() - this.appliedDiscount));
  readonly tax = computed(() => +(this.taxableAmount() * (this.settings().taxRatePercent / 100)).toFixed(2));
  readonly grandTotal = computed(() => +(this.taxableAmount() + this.tax() + this.shippingFee()).toFixed(2));

  constructor(
    public cartSvc: CartService,
    private orderSvc: OrderService,
    private offerSvc: OfferService,
    private seo: SeoService,
    private toast: ToastService,
    private router: Router
  ) {
    this.seo.update('Checkout', 'Complete your AquaShop purchase.');
    if (this.cartSvc.items().length === 0) {
      this.router.navigateByUrl('/cart');
    }
  }

  private customerFullName(): string {
    const c = this.authSvc.getCurrentCustomer();
    return c ? `${c.firstName} ${c.lastName}` : '';
  }

  applyCoupon(): void {
    const offer = this.offerSvc.validateCoupon(this.couponCode);
    if (!offer) {
      this.toast.error('Invalid or expired coupon code');
      return;
    }
    this.appliedDiscount = +(this.cartSvc.subtotal() * (offer.discountPercent / 100)).toFixed(2);
    this.appliedCode = offer.couponCode;
    this.toast.success(`Coupon applied: ${offer.discountPercent}% off`);
  }

  placeOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill in all required fields.');
      return;
    }
    const v = this.form.getRawValue();
    const billingAddress = {
      fullName: v.fullName,
      phone: v.phone,
      addressLine: v.addressLine,
      city: v.city,
      state: v.state,
      country: v.country,
      postalCode: v.postalCode,
    };
    const shippingAddress = v.shipToDifferentAddress
      ? {
          fullName: v.shipFullName || v.fullName,
          phone: v.phone,
          addressLine: v.shipAddressLine || v.addressLine,
          city: v.shipCity || v.city,
          state: v.shipState || v.state,
          country: v.shipCountry || v.country,
          postalCode: v.shipPostalCode || v.postalCode,
        }
      : billingAddress;

    const order = this.orderSvc.placeOrder({
      billingAddress,
      shippingAddress,
      deliveryMethod: v.deliveryMethod,
      paymentMethod: v.paymentMethod,
      couponCode: this.appliedCode,
      discount: this.appliedDiscount,
      shippingFee: this.shippingFee(),
      taxRatePercent: this.settings().taxRatePercent,
    });

    this.placedOrder.set(order);
    this.step.set('confirmation');
  }
}
