import { Component, inject, OnInit, output, Signal, signal, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, IonLabel, IonButton, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html',
  styleUrls: ['./password-reset-form.component.scss'],
  imports: [IonText, IonButton, IonLabel, IonInput, FormsModule]
})
export class PasswordResetFormComponent {
  router = inject(Router);

  email: string = '';
  resetPasswordEvent = output<string>();

  emailControl = viewChild<NgModel>('emailControl');
  submitAttempt = signal<boolean>(false);
  errorMessage = signal<string>('');

  resetPassword(email: string) {
    this.submitAttempt.set(true);
    
    if (this.emailControl()?.invalid) {
      if (this.emailControl()?.errors?.['required']) {
        this.errorMessage.set('El correo electrónico es obligatorio');
      }
      if (this.emailControl()?.errors?.['email']) {
        this.errorMessage.set('El correo electrónico es inválido');
      }
      return;
    }

    this.resetPasswordEvent.emit(email);
    this.router.navigate(['/auth/password-reset-email-sent']);
  }

  onInputFocus(event: any) {
    this.submitAttempt.set(false);
    this.errorMessage.set('');
  }
}
