import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
})
export class AdminCategoriesComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: ['', Validators.required],
    image: ['', Validators.required],
    parentId: [''],
    displayOrder: [1, Validators.required],
    isFeatured: [false],
  });

  constructor(public categorySvc: CategoryService, private toast: ToastService, private confirmSvc: ConfirmDialogService) {}

  get topLevel() {
    return this.categorySvc.categories().filter((c) => !c.parentId);
  }

  childrenOf(parentId: string) {
    return this.categorySvc.categories().filter((c) => c.parentId === parentId);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 1, isFeatured: false });
    this.showForm.set(true);
  }

  openEdit(cat: Category): void {
    this.editingId.set(cat.id);
    this.form.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId ?? '',
      displayOrder: cat.displayOrder,
      isFeatured: cat.isFeatured,
    });
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
      this.categorySvc.update(this.editingId()!, { ...v, parentId: v.parentId || undefined });
      this.toast.success('Category updated');
    } else {
      this.categorySvc.create({
        id: `cat-${Date.now()}`,
        name: v.name,
        slug: v.slug,
        description: v.description,
        image: v.image,
        parentId: v.parentId || undefined,
        displayOrder: v.displayOrder,
        isFeatured: v.isFeatured,
        isActive: true,
      });
      this.toast.success('Category created');
    }
    this.showForm.set(false);
  }

  toggleActive(cat: Category): void {
    this.categorySvc.toggleActive(cat.id);
  }

  async remove(cat: Category): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({
      title: 'Delete category?',
      message: `"${cat.name}" and any subcategories will be removed. Products stay but lose this category link.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (confirmed) {
      this.categorySvc.delete(cat.id);
      this.toast.success('Category deleted');
    }
  }
}
