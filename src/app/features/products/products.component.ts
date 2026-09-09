import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product, ProductFilterOptions } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductGridComponent, PaginationComponent, BreadcrumbComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  loading = true;
  allResults = signal<Product[]>([]);
  currentPage = signal(1);

  search = '';
  sortBy: ProductFilterOptions['sortBy'] = 'newest';
  selectedBrands = new Set<string>();
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly = false;

  readonly pagedResults = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.allResults().slice(start, start + PAGE_SIZE);
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.allResults().length / PAGE_SIZE)));
  readonly availableBrands = computed(() => this.productSvc.getBrandsForCategory());

  constructor(
    private productSvc: ProductService,
    public categorySvc: CategoryService,
    private route: ActivatedRoute,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update('All Products', 'Browse the full AquaShop catalog of fish, tanks, plants, and aquarium gear.');
    this.route.queryParamMap.subscribe((params) => {
      this.search = params.get('q') ?? '';
      this.runSearch();
    });
  }

  toggleBrand(brand: string): void {
    if (this.selectedBrands.has(brand)) this.selectedBrands.delete(brand);
    else this.selectedBrands.add(brand);
    this.runSearch();
  }

  runSearch(): void {
    this.loading = true;
    const options: ProductFilterOptions = {
      search: this.search || undefined,
      sortBy: this.sortBy,
      brands: this.selectedBrands.size ? [...this.selectedBrands] : undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minRating: this.minRating,
      inStockOnly: this.inStockOnly,
    };
    this.productSvc.search(options).subscribe((results) => {
      this.allResults.set(results);
      this.currentPage.set(1);
      this.loading = false;
    });
  }

  clearFilters(): void {
    this.selectedBrands.clear();
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.minRating = undefined;
    this.inStockOnly = false;
    this.runSearch();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
