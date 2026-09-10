import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../../../core/models';
import { BannerService } from '../../../core/services/banner.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-banners.component.html',
})
export class AdminBannersComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subtitle: ['', Validators.required],
    description: ['', Validators.required],
    image: ['', Validators.required],
    buttonText: ['', Validators.required],
    buttonLink: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    displayOrder: [1, Validators.required],
  });

  constructor(public bannerSvc: BannerService, private toast: ToastService, private confirmSvc: ConfirmDialogService) {}

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', subtitle: '', description: '', image: '', buttonText: '', buttonLink: '', startDate: '', endDate: '', displayOrder: 1 });
    this.showForm.set(true);
  }

  openEdit(b: Banner): void {
    this.editingId.set(b.id);
    this.form.patchValue(b);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (this.editingId()) {
      this.bannerSvc.update(this.editingId()!, v);
      this.toast.success('Banner updated');
    } else {
      this.bannerSvc.create({ id: `ban-${Date.now()}`, ...v, active: true });
      this.toast.success('Banner created');
    }
    this.showForm.set(false);
  }

  toggleActive(b: Banner): void {
    this.bannerSvc.toggleActive(b.id);
  }

  async remove(b: Banner): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({ title: 'Delete banner?', message: `"${b.title}" will be permanently removed.`, confirmLabel: 'Delete', danger: true });
    if (confirmed) {
      this.bannerSvc.delete(b.id);
      this.toast.success('Banner deleted');
    }
  }
}
