import { computed, inject, Injectable, signal } from '@angular/core';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

type LoginState = {
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private authService = inject(AuthService);
  private userRepository = inject(UserRepository);
  private cache = inject(LocalStorageService);

  private loading = signal<boolean>(false);
  private errorMessage = signal<string>('');

  loginState = computed<LoginState>(() => ({
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));

  async login({ emailOrUsername, password }: { emailOrUsername: string; password: string }): Promise<void> {
    this.loading.set(true);

    let email: string = emailOrUsername;
    let user: UserModel | null = null; 
    let fcmToken: string | null = await this.cache.get<string | null>('fcmToken');
    
    try {
      user = await this.userRepository.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await this.userRepository.getUserByUsername(emailOrUsername);
        if (!user) {
          this.errorMessage.set('Ese usuario no existe.');
          this.loading.set(false);
          return;
        }
        email = user.email;
      }

      await this.authService.login({ method: 'email', credentials: { email, password }});
      await this.userRepository.updateUser({
        _id: user._id, 
        fcmToken: fcmToken  // If the token is null, the push notification sending attempt will just return void in the firebase functions
      })

      this.errorMessage.set('');
      this.loading.set(false);
    } catch (loginError: any) {
      this.loading.set(false);
      this.errorMessage.set(loginError);
    } 
  }
}
