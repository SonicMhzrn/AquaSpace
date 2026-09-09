import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfferService } from '../../core/services/offer.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, EmptyStateComponent],
  templateUrl: './offers.component.html',
})
export class OffersComponent {
  readonly nonCouponOffers = computed(() => this.offerSvc.activeOffers().filter((o) => o.type !== 'coupon'));
  readonly couponOffers = computed(() => this.offerSvc.activeOffers().filter((o) => o.type === 'coupon'));

  constructor(public offerSvc: OfferService, private productSvc: ProductService, public categorySvc: CategoryService, private seo: SeoService, private toast: ToastService) {
    this.seo.update('Offers & Deals', 'Flash sales, seasonal offers, bundles, and coupon codes at AquaShop.');
  }

  productsForOffer(offerId: string) {
    const offer = this.offerSvc.offers().find((o) => o.id === offerId);
    if (!offer) return [];
    if (offer.productIds.length) {
      return offer.productIds
        .map((id) => this.productSvc.getById(id))
        .filter((p): p is NonNullable<typeof p> => !!p);
    }
    if (offer.categoryIds.length) {
      return this.productSvc.activeProducts().filter((p) => offer.categoryIds.includes(p.categoryId) || (p.subcategoryId ? offer.categoryIds.includes(p.subcategoryId) : false));
    }
    return [];
  }

  copyCoupon(code: string): void {
    navigator.clipboard?.writeText(code);
    this.toast.success(`Copied code "${code}"`);
  }
}
