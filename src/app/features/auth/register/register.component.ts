import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../shared/services/toast.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      addressLine: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: [''],
    },
    { validators: passwordsMatchValidator }
  );

  constructor(private authSvc: AuthService, private router: Router, private seo: SeoService, private toast: ToastService) {
    this.seo.update('Create an Account', 'Register for an AquaShop account to check out faster and track orders.');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const v = this.form.getRawValue();
    this.authSvc
      .register({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        password: v.password,
        addressLine: v.addressLine || undefined,
        city: v.city || undefined,
        state: v.state || undefined,
        country: v.country || undefined,
        postalCode: v.postalCode || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Account created! Welcome to AquaShop.');
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }
}
