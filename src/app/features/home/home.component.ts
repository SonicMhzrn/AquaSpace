import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../core/services/home.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';
import { Banner } from '../../core/models';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { PromoBannerComponent } from '../../shared/components/promo-banner/promo-banner.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';

/**
 * Guaranteed fallback so the hero section is never blank. Used only when
 * there are zero active banners in the store — e.g. every banner has been
 * deactivated in Admin -> Banners, or a stale localStorage snapshot has
 * none marked active. Without this, `HeroBanner` resolves to `undefined`
 * and the entire hero section silently disappears.
 */
const FallbackHeroBanner: Banner = {
  id: 'fallback-hero',
  title: 'Dive Into Your Perfect Aquarium',
  subtitle: 'Everything Your Aquatic World Needs',
  description: 'Shop premium fish, tanks, plants, and gear curated for beginners and experts alike.',
  image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1600&q=80',
  buttonText: 'Shop Now',
  buttonLink: '/products',
  startDate: '',
  endDate: '',
  active: true,
  displayOrder: 0,
};

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
export class HomeComponent implements OnInit, OnDestroy {
  NewsletterEmail = '';

  /** Index of the currently displayed hero banner — rotates automatically. */
  private readonly HeroIndex = signal(0);
  private HeroIntervalId?: ReturnType<typeof setInterval>;

  /**
   * Always resolves to a real banner: falls back to `FallbackHeroBanner`
   * when there are no active banners, so the hero section never renders
   * blank regardless of admin/data state.
   */
  readonly HeroBanner = computed<Banner>(() => {
    const Banners = this.Home.banners.activeBanners();
    if (Banners.length === 0) return FallbackHeroBanner;
    return Banners[this.HeroIndex() % Banners.length];
  });

  readonly PromoBanner = computed(() => this.Home.banners.activeBanners()[3] ?? this.Home.banners.activeBanners()[0]);
  readonly FeaturedCategories = computed(() => this.Home.categories.featuredCategories().slice(0, 6));
  readonly FeaturedProducts = computed(() => this.Home.products.featuredProducts().slice(0, 8));
  readonly NewArrivals = computed(() => this.Home.products.newArrivals().slice(0, 4));
  readonly BestSellers = computed(() => this.Home.products.bestSellers().slice(0, 4));
  readonly RecentReviews = computed(() => [...this.Home.reviews.reviews()].slice(-6).reverse());
  readonly RecentPosts = computed(() => this.Home.blog.publishedPosts().slice(0, 3));

  /** Trust stats shown beneath the hero banner. */
  readonly HeroStats = [
    { Value: '10,000+', Label: 'Happy Aquarists' },
    { Value: '500+', Label: 'Fish & Plant Species' },
    { Value: '4.9★', Label: 'Average Rating' },
    { Value: 'Free', Label: 'Shipping Over $75' },
  ];

  readonly WhyUsPoints = [
    { Title: 'Expert-Vetted Livestock', Description: 'Every fish is quarantined and health-checked before it ever reaches your door.', Icon: 'shield' },
    { Title: 'Water-Quality First', Description: 'Our test kits, conditioners, and filters are chosen by working aquarists, not just marketers.', Icon: 'drop' },
    { Title: 'Fast, Careful Shipping', Description: 'Livestock ships in insulated, oxygenated bags with temperature packs when needed.', Icon: 'truck' },
    { Title: 'Real Aquarist Support', Description: 'Questions about cycling, compatibility, or a sick fish? Our team has kept tanks for decades.', Icon: 'chat' },
  ];

  constructor(public Home: HomeService, private Seo: SeoService, private Toast: ToastService) {
    this.Seo.update(
      'Dive Into Your Perfect Aquarium',
      'Shop premium fish, tanks, plants, and aquarium gear at AquaShop — curated for beginners and experts alike.'
    );
  }

  ngOnInit(): void {
    // Auto-advance the hero banner every 6s. Started in ngOnInit (not a
    // field initializer) so it's tied to the component's actual lifecycle.
    this.HeroIntervalId = setInterval(() => this.HeroIndex.update((I) => I + 1), 6000);
  }

  ngOnDestroy(): void {
    if (this.HeroIntervalId) clearInterval(this.HeroIntervalId);
  }

  IsEnabled(Type: string): boolean {
    return this.Home.enabledSections().some((S) => S.type === Type);
  }

  SectionTitle(Type: string, Fallback: string): string {
    return this.Home.enabledSections().find((S) => S.type === Type)?.title ?? Fallback;
  }

  Subscribe(): void {
    if (!this.NewsletterEmail.trim()) return;
    this.Toast.success('You\u2019re subscribed! Watch your inbox for aquarium tips.');
    this.NewsletterEmail = '';
  }
}
