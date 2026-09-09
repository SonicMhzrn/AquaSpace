import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  activeTab: 'info' | 'addresses' | 'security' | 'notifications' = 'info';

  private fb = inject(FormBuilder);
  authSvc = inject(AuthService);

  customer = this.authSvc.getCurrentCustomer();
  savingInfo = signal(false);
  changingPassword = signal(false);
  passwordError = signal<string | null>(null);

  notificationPrefs = { orderUpdates: true, promotions: true, newsletter: false };

  infoForm = this.fb.nonNullable.group({
    firstName: [this.customer?.firstName ?? '', Validators.required],
    lastName: [this.customer?.lastName ?? '', Validators.required],
    phone: [this.customer?.phone ?? '', Validators.required],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    public orderSvc: OrderService,
    public wishlistSvc: WishlistService,
    private seo: SeoService,
    private toast: ToastService
  ) {
    this.seo.update('My Profile', 'Manage your AquaShop account details, addresses, and security.');
  }

  get initials(): string {
    return `${this.customer?.firstName?.charAt(0) ?? ''}${this.customer?.lastName?.charAt(0) ?? ''}`;
  }

  saveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    this.savingInfo.set(true);
    this.authSvc.updateCurrentCustomer(this.infoForm.getRawValue());
    this.customer = this.authSvc.getCurrentCustomer();
    this.savingInfo.set(false);
    this.toast.success('Profile updated');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.changingPassword.set(true);
    this.passwordError.set(null);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.authSvc.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.toast.success('Password changed successfully');
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordError.set(err.message);
      },
    });
  }

  logout(): void {
    this.authSvc.logout();
  }
}
