import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiresAuth = route.data?.['authStatusMustBe'];

  const isAuthenticated = !!authService.currentUser();

  if (requiresAuth && isAuthenticated) return true;
  if (!requiresAuth && !isAuthenticated) return true;

  router.navigate([requiresAuth ? '/auth' : '']);
  return false;
};

/* export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return !!authService.currentUser();
};

export const guestGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return !authService.currentUser();
}; */