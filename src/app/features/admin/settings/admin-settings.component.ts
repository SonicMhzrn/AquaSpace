import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
})
export class AdminSettingsComponent {
  activeTab: 'store' | 'commerce' | 'social' | 'general' = 'store';

  private fb = inject(FormBuilder);
  settingsSvc = inject(SettingsService);

  form = this.fb.nonNullable.group({
    storeName: [this.settingsSvc.settings().storeName, Validators.required],
    email: [this.settingsSvc.settings().email, [Validators.required, Validators.email]],
    phone: [this.settingsSvc.settings().phone, Validators.required],
    address: [this.settingsSvc.settings().address, Validators.required],
    businessHours: [this.settingsSvc.settings().businessHours, Validators.required],
    currency: [this.settingsSvc.settings().currency, Validators.required],
    currencySymbol: [this.settingsSvc.settings().currencySymbol, Validators.required],
    taxRatePercent: [this.settingsSvc.settings().taxRatePercent, [Validators.required, Validators.min(0)]],
    shippingFee: [this.settingsSvc.settings().shippingFee, [Validators.required, Validators.min(0)]],
    freeShippingThreshold: [this.settingsSvc.settings().freeShippingThreshold, [Validators.required, Validators.min(0)]],
    facebook: [this.settingsSvc.settings().socialLinks.facebook],
    instagram: [this.settingsSvc.settings().socialLinks.instagram],
    youtube: [this.settingsSvc.settings().socialLinks.youtube],
    tiktok: [this.settingsSvc.settings().socialLinks.tiktok],
    maintenanceMode: [this.settingsSvc.settings().maintenanceMode],
    registrationEnabled: [this.settingsSvc.settings().registrationEnabled],
    reviewsEnabled: [this.settingsSvc.settings().reviewsEnabled],
    wishlistEnabled: [this.settingsSvc.settings().wishlistEnabled],
  });

  private toast = inject(ToastService);

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.settingsSvc.update({
      storeName: v.storeName,
      email: v.email,
      phone: v.phone,
      address: v.address,
      businessHours: v.businessHours,
      currency: v.currency,
      currencySymbol: v.currencySymbol,
      taxRatePercent: v.taxRatePercent,
      shippingFee: v.shippingFee,
      freeShippingThreshold: v.freeShippingThreshold,
      socialLinks: { facebook: v.facebook, instagram: v.instagram, youtube: v.youtube, tiktok: v.tiktok },
      maintenanceMode: v.maintenanceMode,
      registrationEnabled: v.registrationEnabled,
      reviewsEnabled: v.reviewsEnabled,
      wishlistEnabled: v.wishlistEnabled,
    });
    this.toast.success('Settings saved');
  }
}
