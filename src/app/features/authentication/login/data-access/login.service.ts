import { inject, Injectable, signal } from '@angular/core';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  #authService = inject(AuthService);
  #userRepository = inject(UserRepository);
  #cache = inject(LocalStorageService);

  public errorMessage = signal<string>(''); // Allow to be changed from login page on control focus

  async login({ emailOrUsername, password }: { emailOrUsername: string; password: string }): Promise<void> {
    let email: string = emailOrUsername;
    let user: UserModel | null = null; 
    let fcmToken: string | null = await this.#cache.get<string | null>('fcmToken');
    
    try {
      user = await this.#userRepository.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await this.#userRepository.getUserByUsername(emailOrUsername);
        if (!user) {
          this.errorMessage.set('Ese usuario no existe.');
          return;
        }
        email = user.email;
      }

      await this.#authService.login({ method: 'email', credentials: { email, password }});
      await this.#userRepository.updateUser({
        _id: user._id, 
        fcmToken: fcmToken
      })
    } catch (loginError: any) {
      this.errorMessage.set(loginError);
    } 
  }
}
