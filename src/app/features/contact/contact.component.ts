import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  submitting = signal(false);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor(public settingsSvc: SettingsService, private seo: SeoService, private toast: ToastService) {
    this.seo.update('Contact Us', 'Get in touch with the AquaShop team for questions about orders, fish care, or products.');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.form.reset();
      this.toast.success('Message sent! We\u2019ll get back to you within one business day.');
    }, 600);
  }
}
