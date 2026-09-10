import { Component, Input, computed } from '@angular/core';
import { ENUM_ToastType } from '../../enum/enum.shared';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  ENUM_ToastType = ENUM_ToastType;

  constructor(private cartSvc: CartService, private wishlistSvc: WishlistService, private toast: ToastService) {}

  get stockStatus() {
    return ProductService.computeStockStatus(this.product);
  }

  get discountPercent(): number | null {
    if (!this.product.salePrice) return null;
    return Math.round(((this.product.price - this.product.salePrice) / this.product.price) * 100);
  }

  get isWishlisted(): boolean {
    return this.wishlistSvc.isWishlisted(this.product.id);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistSvc.toggle(this.product.id);
    this.toast.show(this.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist', ENUM_ToastType.Success);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const result = this.cartSvc.add(this.product.id, 1);
    if (result.ok) {
      this.toast.success(`${this.product.name} added to cart`);
    } else {
      this.toast.error(result.message ?? 'Could not add to cart');
    }
  }
}
