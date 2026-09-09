import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OfferService } from '../../core/services/offer.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, QuantitySelectorComponent, EmptyStateComponent],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  couponCode = '';
  appliedDiscount = 0;
  appliedCode?: string;

  private settingsSvc = inject(SettingsService);
  readonly settings = this.settingsSvc.settings;

  readonly shippingFee = computed(() => {
    const subtotal = this.cartSvc.subtotal();
    if (subtotal === 0) return 0;
    return subtotal >= this.settings().freeShippingThreshold ? 0 : this.settings().shippingFee;
  });

  readonly taxableAmount = computed(() => Math.max(0, this.cartSvc.subtotal() - this.appliedDiscount));
  readonly tax = computed(() => +(this.taxableAmount() * (this.settings().taxRatePercent / 100)).toFixed(2));
  readonly grandTotal = computed(() => +(this.taxableAmount() + this.tax() + this.shippingFee()).toFixed(2));

  constructor(
    public cartSvc: CartService,
    private offerSvc: OfferService,
    private seo: SeoService,
    private toast: ToastService
  ) {
    this.seo.update('Your Cart', 'Review the items in your AquaShop cart before checkout.');
  }

  updateQuantity(productId: string, quantity: number): void {
    const result = this.cartSvc.updateQuantity(productId, quantity);
    if (!result.ok) this.toast.error(result.message ?? 'Could not update quantity');
  }

  remove(productId: string): void {
    this.cartSvc.remove(productId);
    this.toast.success('Item removed from cart');
  }

  clearCart(): void {
    this.cartSvc.clear();
    this.appliedDiscount = 0;
    this.appliedCode = undefined;
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
}
