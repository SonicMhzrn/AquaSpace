import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { ProductCardComponent } from '../product-card/product-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, EmptyStateComponent, LoadingComponent],
  templateUrl: './product-grid.component.html',
})
export class ProductGridComponent {
  @Input({ required: true }) products: Product[] = [];
  @Input() loading = false;
  @Input() emptyTitle = 'No products found';
  @Input() emptyDescription = 'Try adjusting your filters or search terms.';

  trackById(_index: number, product: Product): string {
    return product.id;
  }
}
