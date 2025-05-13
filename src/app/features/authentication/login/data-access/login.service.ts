import { inject, Injectable, signal } from '@angular/core';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  #authService = inject(AuthService);
  #userRepository = inject(UserRepository);

  public errorMessage = signal<string>(''); // Allow to be changed from login page on control focus

  #isEmail(input: string): boolean {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(input);
  }

  async login({ emailOrUsername, password }: { emailOrUsername: string; password: string }): Promise<void> {
    let email: string | null = emailOrUsername;
    let user: UserModel | null = null; 
    
    try {
      if (!emailOrUsername.includes('@') || !this.#isEmail(emailOrUsername)) {
        user = await this.#userRepository.getUserByUsername(emailOrUsername);
        if (!user) {
          this.errorMessage.set('Ese usuario no existe.');
          return;
        }
        email = emailOrUsername;
      }

      await this.#authService.login({ method: 'email', credentials: { email, password }});
    } catch (loginError: any) {
      this.errorMessage.set(loginError);
    } 
  }
}
