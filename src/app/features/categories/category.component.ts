import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Category, Product, ProductFilterOptions } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductGridComponent, PaginationComponent, BreadcrumbComponent, EmptyStateComponent],
  templateUrl: './category.component.html',
})
export class CategoryComponent implements OnInit {
  category?: Category;
  parentCategory?: Category;
  subcategories: Category[] = [];
  loading = true;
  allResults = signal<Product[]>([]);
  currentPage = signal(1);

  sortBy: ProductFilterOptions['sortBy'] = 'newest';
  activeSubcategorySlug?: string;

  readonly pagedResults = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.allResults().slice(start, start + PAGE_SIZE);
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.allResults().length / PAGE_SIZE)));

  constructor(
    private route: ActivatedRoute,
    private productSvc: ProductService,
    public categorySvc: CategoryService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.activeSubcategorySlug = undefined;
      this.load(slug);
    });
  }

  private load(slug: string): void {
    const category = this.categorySvc.getBySlug(slug);
    this.category = category;
    if (!category) {
      this.loading = false;
      return;
    }
    this.parentCategory = category.parentId ? this.categorySvc.getById(category.parentId) : undefined;
    this.subcategories = category.parentId ? [] : this.categorySvc.getSubcategories(category.id);
    this.seo.update(category.name, category.description);
    this.runSearch(slug);
  }

  filterBySubcategory(slug?: string): void {
    this.activeSubcategorySlug = slug;
    this.runSearch(slug ?? this.category!.slug);
  }

  runSearch(slug: string): void {
    this.loading = true;
    this.productSvc.search({ categorySlug: slug, sortBy: this.sortBy }).subscribe((results) => {
      this.allResults.set(results);
      this.currentPage.set(1);
      this.loading = false;
    });
  }

  onSortChange(): void {
    this.runSearch(this.activeSubcategorySlug ?? this.category!.slug);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
