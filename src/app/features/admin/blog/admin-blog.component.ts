import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogPost } from '../../../core/models';
import { BlogService } from '../../../core/services/blog.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-blog.component.html',
})
export class AdminBlogComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    description: ['', Validators.required],
    content: ['', Validators.required],
    image: ['', Validators.required],
    category: ['', Validators.required],
    author: ['', Validators.required],
    publishedDate: ['', Validators.required],
    tags: [''],
  });

  constructor(public blogSvc: BlogService, private toast: ToastService, private confirmSvc: ConfirmDialogService) {}

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', slug: '', description: '', content: '', image: '', category: '', author: '', publishedDate: '', tags: '' });
    this.showForm.set(true);
  }

  openEdit(p: BlogPost): void {
    this.editingId.set(p.id);
    this.form.patchValue({ ...p, tags: p.tags.join(', ') });
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
    const tags = v.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (this.editingId()) {
      this.blogSvc.update(this.editingId()!, { ...v, tags });
      this.toast.success('Article updated');
    } else {
      this.blogSvc.create({ id: `blog-${Date.now()}`, ...v, tags, status: 'Draft' });
      this.toast.success('Article created as draft');
    }
    this.showForm.set(false);
  }

  togglePublish(p: BlogPost): void {
    this.blogSvc.togglePublish(p.id);
  }

  async remove(p: BlogPost): Promise<void> {
    const confirmed = await this.confirmSvc.confirm({ title: 'Delete article?', message: `"${p.title}" will be permanently removed.`, confirmLabel: 'Delete', danger: true });
    if (confirmed) {
      this.blogSvc.delete(p.id);
      this.toast.success('Article deleted');
    }
  }
}
