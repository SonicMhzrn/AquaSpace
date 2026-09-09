import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [true],
  });

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private seo: SeoService,
    private toast: ToastService
  ) {
    this.seo.update('Login', 'Log in to your AquaShop account.');
  }

  fillDemo(role: 'admin' | 'customer'): void {
    if (role === 'admin') this.form.patchValue({ email: 'admin@aquashop.com', password: 'Admin@123' });
    else this.form.patchValue({ email: 'jordan@example.com', password: 'Demo@123' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const { email, password, rememberMe } = this.form.getRawValue();
    this.authSvc.login(email, password, rememberMe).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Welcome back!');
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo || '/');
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
