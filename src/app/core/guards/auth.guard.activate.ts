import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, ROUTER_OUTLET_DATA, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const mustBeAuth = route.data['mustBeAuth'] === true;
    const isAuthenticated = !!this.authService.currentUser();

    if (mustBeAuth && isAuthenticated) return true;
    if (!mustBeAuth && !isAuthenticated) return true;

    this.router.navigate([mustBeAuth ? '/welcome' : '/home']);
    return false;
  }
}