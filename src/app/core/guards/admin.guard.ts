import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Blocks the /admin/** area from anyone who isn't logged in with the admin role. */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  if (auth.isAuthenticated()) return router.createUrlTree(['/']);
  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
