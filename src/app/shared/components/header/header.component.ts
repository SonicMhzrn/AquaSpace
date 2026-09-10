import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly mobileMenuOpen = signal(false);
  readonly categoryMenuOpen = signal(false);
  readonly accountMenuOpen = signal(false);

  constructor(
    public cartSvc: CartService,
    public wishlistSvc: WishlistService,
    public authSvc: AuthService,
    public categorySvc: CategoryService
  ) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authSvc.logout();
    this.accountMenuOpen.set(false);
  }
}
