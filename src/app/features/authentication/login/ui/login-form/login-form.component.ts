import { Component, inject, input, OnInit, output, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonInput, IonInputPasswordToggle, IonButton, IonLabel, IonText, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [IonSpinner, RouterLink, IonText, IonLabel, IonInput, IonInputPasswordToggle, IonButton, FormsModule, ReactiveFormsModule]
})
export class LoginFormComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  loginForm!: FormGroup;

  submitAttempt = input<boolean>(false);
  loading = input<boolean>(false);
  forgotPasswordVisible = input<boolean>(false);

  authErrorMessage = input<string>('');

  controlFocus = output<string>();

  constructor() {
    addIcons({ closeCircleOutline });
  }

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm() {
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

