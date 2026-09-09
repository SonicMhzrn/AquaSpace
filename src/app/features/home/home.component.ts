import { Component, computed, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../core/services/home.service';
import { SeoService } from '../../core/services/seo.service';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { PromoBannerComponent } from '../../shared/components/promo-banner/promo-banner.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HeroBannerComponent,
    PromoBannerComponent,
    CategoryCardComponent,
    ProductCardComponent,
    RatingComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnDestroy {
  newsletterEmail = '';

  /** Index of the currently displayed hero banner — rotates automatically. */
  private readonly heroIndex = signal(0);
  private readonly heroIntervalId = setInterval(() => this.heroIndex.update((i) => i + 1), 6000);

  readonly heroBanner = computed(() => {
    const banners = this.home.banners.activeBanners();
    return banners.length > 0 ? banners[this.heroIndex() % banners.length] : undefined;
  });
  readonly promoBanner = computed(() => this.home.banners.activeBanners()[3] ?? this.home.banners.activeBanners()[0]);
  readonly featuredCategories = computed(() => this.home.categories.featuredCategories().slice(0, 6));
  readonly featuredProducts = computed(() => this.home.products.featuredProducts().slice(0, 8));
  readonly newArrivals = computed(() => this.home.products.newArrivals().slice(0, 4));
  readonly bestSellers = computed(() => this.home.products.bestSellers().slice(0, 4));
  readonly recentReviews = computed(() => [...this.home.reviews.reviews()].slice(-6).reverse());
  readonly recentPosts = computed(() => this.home.blog.publishedPosts().slice(0, 3));

  /** Trust stats shown beneath the hero banner. */
  readonly heroStats = [
    { value: '10,000+', label: 'Happy Aquarists' },
    { value: '500+', label: 'Fish & Plant Species' },
    { value: '4.9★', label: 'Average Rating' },
    { value: 'Free', label: 'Shipping Over $75' },
  ];

  readonly whyUsPoints = [
    { title: 'Expert-Vetted Livestock', description: 'Every fish is quarantined and health-checked before it ever reaches your door.', icon: 'shield' },
    { title: 'Water-Quality First', description: 'Our test kits, conditioners, and filters are chosen by working aquarists, not just marketers.', icon: 'drop' },
    { title: 'Fast, Careful Shipping', description: 'Livestock ships in insulated, oxygenated bags with temperature packs when needed.', icon: 'truck' },
    { title: 'Real Aquarist Support', description: 'Questions about cycling, compatibility, or a sick fish? Our team has kept tanks for decades.', icon: 'chat' },
  ];

  constructor(public home: HomeService, private seo: SeoService, private toast: ToastService) {   
    effect(() => {
      console.log(this.heroIndex());
    });
    this.seo.update('Dive Into Your Perfect Aquarium', 'Shop premium fish, tanks, plants, and aquarium gear at AquaShop — curated for beginners and experts alike.');
  }

  isEnabled(type: string): boolean {
    return this.home.enabledSections().some((s) => s.type === type);
  }

  sectionTitle(type: string, fallback: string): string {
    return this.home.enabledSections().find((s) => s.type === type)?.title ?? fallback;
  }

  subscribe(): void {
    if (!this.newsletterEmail.trim()) return;
    this.toast.success('You\u2019re subscribed! Watch your inbox for aquarium tips.');
    this.newsletterEmail = '';
  }

  ngOnDestroy(): void {
    clearInterval(this.heroIntervalId);
  }
}
