import { Injectable, inject, signal } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.currentUser()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}