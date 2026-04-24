import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getDashboardRoute } from './auth.guard';

/**
 * Role-based guard factory.
 * Usage:  canActivate: [authGuard, roleGuard(['Admin'])]
 *
 * If the logged-in user does NOT have one of the required roles,
 * they are immediately redirected to their own dashboard.
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    // Wrong role — redirect to their own dashboard
    router.navigate([getDashboardRoute(auth.getRoles())]);
    return false;
  };
}
