import { Component, input, output, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonInput, IonInputPasswordToggle, IonButton, IonIcon, IonLabel, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [RouterLink, IonText, IonLabel, IonIcon, IonInput, IonInputPasswordToggle, IonButton, FormsModule, ReactiveFormsModule]
})
export class LoginFormComponent {
  loginForm: FormGroup;

  submitAttempt = input<boolean>(false);
  disabledSubmitButton = input<boolean>(false);

  authProviderErrorMessage = input<string>('');

  controlFocus = output<string>();

  constructor(private fb: FormBuilder) {
    addIcons({ closeCircleOutline });

    this.loginForm = this.fb.group({
      emailOrUsername: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      password: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }]
    })
  }

  formSubmit = output<{ emailOrUsername: string; password: string }>();
}

