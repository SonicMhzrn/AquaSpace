import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingComponent],
  templateUrl: './admin-reviews.component.html',
})
export class AdminReviewsComponent {
  search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.reviewSvc.reviews().filter((r) => !q || r.customerName.toLowerCase().includes(q) || this.productName(r.productId).toLowerCase().includes(q));
  });

  constructor(public reviewSvc: ReviewService, private productSvc: ProductService, private toast: ToastService, private confirmSvc: ConfirmDialogService) {}

  productName(productId: string): string {
    return this.productSvc.getById(productId)?.name ?? 'Unknown product';
  }

  async remove(id: string): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({ title: 'Delete review?', message: 'This review will be permanently removed.', confirmLabel: 'Delete', danger: true });
    if (confirmed) {
      this.reviewSvc.delete(id);
      this.toast.success('Review deleted');
    }
  }
}
