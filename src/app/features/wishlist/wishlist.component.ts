import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  constructor(public wishlistSvc: WishlistService, private seo: SeoService, private toast: ToastService) {
    this.seo.update('Your Wishlist', 'Saved aquarium products you\u2019re considering.');
  }

  moveToCart(productId: string): void {
    this.wishlistSvc.moveToCart(productId);
    this.toast.success('Moved to cart');
  }

  remove(productId: string): void {
    this.wishlistSvc.remove(productId);
  }
}
