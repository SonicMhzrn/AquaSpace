import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent {
  search = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  categoryFilter = signal<string>('all');

  readonly filtered = computed<Product[]>(() => {
    const q = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const cat = this.categoryFilter();
    return this.productSvc.products().filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || (status === 'active' ? p.isActive : !p.isActive);
      const matchesCategory = cat === 'all' || p.categoryId === cat || p.subcategoryId === cat;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  });

  constructor(
    public productSvc: ProductService,
    public categorySvc: CategoryService,
    private toast: ToastService,
    private confirmSvc: ConfirmDialogService
  ) {}

  stockStatus(p: Product) {
    return ProductService.computeStockStatus(p);
  }

  toggleActive(p: Product): void {
    this.productSvc.toggleActive(p.id);
    this.toast.success(`${p.name} ${p.isActive ? 'deactivated' : 'activated'}`);
  }

  duplicate(p: Product): void {
    this.productSvc.duplicate(p.id);
    this.toast.success(`Duplicated ${p.name}`);
  }

  async remove(p: Product): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({
      title: 'Delete product?',
      message: `This will permanently remove "${p.name}" from the catalog.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (confirmed) {
      this.productSvc.delete(p.id);
      this.toast.success('Product deleted');
    }
  }
}
