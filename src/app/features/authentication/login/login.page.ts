import { Component, inject, signal, computed, linkedSignal, viewChild, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ViewDidLeave, ViewDidEnter } from '@ionic/angular';

import { LoginFormComponent } from './ui/login-form/login-form.component';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { LoginService } from './data-access/login.service';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ToolbarComponent, IonHeader, LoginFormComponent, IonContent, CommonModule, FormsModule]
})
export class LoginPage {
  private router = inject(Router);
  private loginService = inject(LoginService);

  loading = computed(() => this.loginService.loginState().loading);
  errorMessage = linkedSignal(() => this.loginService.loginState().errorMessage ?? '');
  
  loginFormComponent = viewChild(LoginFormComponent);
  submitAttempted = signal<boolean>(false);
  forgotPasswordVisible = signal<boolean>(false);

  constructor() {
    addIcons({ arrowBackOutline });

    effect(() => {
      if (this.errorMessage()) {
        this.forgotPasswordVisible.set(true);
      }
    })
  }

  onControlFocus(control: string) {
    this.submitAttempted.set(false);
    this.errorMessage.set('');
  }

  onBackPressed() {
    this.router.navigate(['/auth/landing']);
  }

  onGoToRegister() {
    console.log(this.loading());
    if (!this.loading()) {
      this.router.navigate(['/auth/register']);
    }
  }


  async login({ emailOrUsername, password }: { emailOrUsername: string; password: string }): Promise<void> {
    this.submitAttempted.set(true);
    this.errorMessage.set('');
    if (this.loginFormComponent()?.loginForm?.valid) {
      await this.loginService.login({ 
        emailOrUsername, 
        password
      });
      
      if (!this.errorMessage()) {
        this.router.navigate(['/tabs']);
      }
    }
  }
}
