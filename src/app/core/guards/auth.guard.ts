import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const requiresAuth = route.data?.['authStateMustBe'];
  const isAuthenticated = authService.authState().isAuthenticated;

  if (requiresAuth && isAuthenticated) return true;
  if (!requiresAuth && !isAuthenticated) return true;

  router.navigate([requiresAuth ? '/auth' : '']);
  return false;
};