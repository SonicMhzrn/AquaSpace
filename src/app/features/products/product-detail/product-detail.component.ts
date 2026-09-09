import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../shared/services/toast.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { QuantitySelectorComponent } from '../../../shared/components/quantity-selector/quantity-selector.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

const RECENTLY_VIEWED_KEY = 'aquashop:recently-viewed';
const MAX_RECENT = 8;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingComponent, QuantitySelectorComponent, BreadcrumbComponent, ProductCardComponent, EmptyStateComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  activeImageIndex = signal(0);
  quantity = 1;
  activeTab: 'description' | 'specifications' | 'reviews' = 'description';
  relatedProducts: Product[] = [];
  recentlyViewed: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productSvc: ProductService,
    public categorySvc: CategoryService,
    public reviewSvc: ReviewService,
    private cartSvc: CartService,
    public wishlistSvc: WishlistService,
    private seo: SeoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id')!;
      this.load(id);
    });
  }

  private load(id: string): void {
    const product = this.productSvc.getById(id);
    this.product = product;
    this.activeImageIndex.set(0);
    this.quantity = 1;
    this.activeTab = 'description';
    if (!product) return;

    this.seo.update(product.seo?.metaTitle ?? product.name, product.seo?.metaDescription ?? '');
    this.relatedProducts = this.productSvc.getRelated(product);
    this.trackRecentlyViewed(product.id);
    this.recentlyViewed = this.getRecentlyViewed().filter((p) => p.id !== product.id);
  }

  get stockStatus() {
    return this.product ? ProductService.computeStockStatus(this.product) : 'Out of Stock';
  }

  get discountPercent(): number | null {
    if (!this.product?.salePrice) return null;
    return Math.round(((this.product.price - this.product.salePrice) / this.product.price) * 100);
  }

  get categoryName(): string {
    if (!this.product) return '';
    return this.categorySvc.getById(this.product.subcategoryId ?? this.product.categoryId)?.name ?? '';
  }

  addToCart(): void {
    if (!this.product) return;
    const result = this.cartSvc.add(this.product.id, this.quantity);
    if (result.ok) this.toast.success(`${this.quantity} × ${this.product.name} added to cart`);
    else this.toast.error(result.message ?? 'Could not add to cart');
  }

  buyNow(): void {
    this.addToCart();
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistSvc.toggle(this.product.id);
    this.toast.success(this.wishlistSvc.isWishlisted(this.product.id) ? 'Added to wishlist' : 'Removed from wishlist');
  }

  private trackRecentlyViewed(id: string): void {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    ids = [id, ...ids.filter((i) => i !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  }

  private getRecentlyViewed(): Product[] {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.map((id) => this.productSvc.getById(id)).filter((p): p is Product => !!p);
  }
}
