import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Blocks unauthenticated or token-expired users and sends them to /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Prevents already-logged-in users from visiting /login or /signup.
 * Redirects them straight to their own dashboard.
 */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  router.navigate([getDashboardRoute(auth.getRoles())]);
  return false;
};

export function getDashboardRoute(roles: string[]): string {
  if (roles.includes('Admin'))            return '/admin';
  if (roles.includes('Reception'))        return '/reception';
  if (roles.includes('Lab Technologist')) return '/lab-technologist';
  if (roles.includes('Phlebotomist'))     return '/phlebotomist';
  if (roles.includes('Pathologist'))      return '/pathologist';
  if (roles.includes('Patient'))          return '/patient';
  return '/login';
}
