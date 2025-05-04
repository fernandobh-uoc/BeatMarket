import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonImg, IonButton, IonHeader, IonToolbar, IonButtons, IonIcon, IonTitle, IonProgressBar, IonBackButton } from '@ionic/angular/standalone';

import { LoginFormComponent } from './ui/login-form/login-form.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { LoginService } from './data-access/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonBackButton, IonProgressBar, IonTitle, IonIcon, IonButtons, IonToolbar, IonHeader, IonButton, LoginFormComponent, IonContent, IonImg, CommonModule, FormsModule, RouterLink]
})
export class LoginPage {
  #router = inject(Router);
  #loginService = inject(LoginService);

  constructor() {
    addIcons({ arrowBackOutline });
  }

  loginFormComponent = viewChild(LoginFormComponent);

  submitAttempt = signal<boolean>(false);
  authProviderErrorMessage = computed(() => this.#loginService.errorMessage() ?? '');
  disabledSubmitButton = signal<boolean>(false);

  onControlFocus(control: string) {
    this.submitAttempt.set(false);
    this.disabledSubmitButton.set(false);
    this.#loginService.errorMessage.set('');
  }

  async handleLogin({ emailOrUsername, password }: { emailOrUsername: string; password: string }): Promise<void> {
    this.submitAttempt.set(true);
    if (this.loginFormComponent()?.loginForm?.valid) {
      this.disabledSubmitButton.set(true);

      await this.#loginService.login({ 
        emailOrUsername, 
        password
      });
      
      if (!this.authProviderErrorMessage()) {
        this.#router.navigate(['/tabs']);
      }
    }
  }

  /* async handleGoogleLogin(): Promise<void> {
    //this.#authService.setAuthMethod('google');
    //await this.#authService.login({ method: 'google' });
  }
  
  async handleAppleLogin(): Promise<void> {
    //this.#authService.setAuthMethod('apple');
    //await this.#authService.login({ method: 'apple' });
  } */
}
