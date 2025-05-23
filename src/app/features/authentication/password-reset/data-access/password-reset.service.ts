import { inject, Injectable } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private authService = inject(AuthService);

  constructor() { }

  resetPassword(email: string): void {
    this.authService.resetPassword(email);
  }
}
