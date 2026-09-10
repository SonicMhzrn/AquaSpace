import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  /** The admin area renders its own AdminLayout (sidebar + admin header), so the customer chrome is hidden there. */
  readonly isAdminRoute = signal(false);

  constructor(private router: Router) {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
    });
  }
}
