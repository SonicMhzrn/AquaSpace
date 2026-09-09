import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Offer } from '../../../core/models';
import { OfferService } from '../../../core/services/offer.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-offers.component.html',
})
export class AdminOffersComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    discountPercent: [10, [Validators.required, Validators.min(1), Validators.max(90)]],
    type: ['seasonal' as Offer['type'], Validators.required],
    couponCode: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    categoryIds: [[] as string[]],
    productIds: [[] as string[]],
  });

  constructor(
    public offerSvc: OfferService,
    public productSvc: ProductService,
    public categorySvc: CategoryService,
    private toast: ToastService,
    private confirmSvc: ConfirmDialogService
  ) {}

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', description: '', discountPercent: 10, type: 'seasonal', couponCode: '', startDate: '', endDate: '', categoryIds: [], productIds: [] });
    this.showForm.set(true);
  }

  openEdit(o: Offer): void {
    this.editingId.set(o.id);
    this.form.patchValue(o);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  toggleCategory(id: string): void {
    const current = this.form.controls.categoryIds.value;
    this.form.controls.categoryIds.setValue(current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (this.editingId()) {
      this.offerSvc.update(this.editingId()!, v);
      this.toast.success('Offer updated');
    } else {
      this.offerSvc.create({ id: `off-${Date.now()}`, ...v, active: true });
      this.toast.success('Offer created');
    }
    this.showForm.set(false);
  }

  toggleActive(o: Offer): void {
    this.offerSvc.toggleActive(o.id);
  }

  async remove(o: Offer): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({ title: 'Delete offer?', message: `"${o.title}" will be permanently removed.`, confirmLabel: 'Delete', danger: true });
    if (confirmed) {
      this.offerSvc.delete(o.id);
      this.toast.success('Offer deleted');
    }
  }
}
