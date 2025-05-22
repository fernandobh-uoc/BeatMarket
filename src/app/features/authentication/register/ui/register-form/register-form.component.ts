import { Component, signal, input, output, WritableSignal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { IonInput, IonSelect, IonSelectOption, IonInputPasswordToggle, IonButton, IonLabel, IonAvatar, IonText, IonIcon, IonModal, IonCheckbox, IonTextarea, IonSpinner } from '@ionic/angular/standalone';

import { EmailValidator } from '../../utils/validators/email.validator';
import { UsernameValidator } from '../../utils/validators/username.validator';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircleOutline, closeCircleOutline, globeOutline } from 'ionicons/icons';

import { countries } from "../../../../../shared/utils/countries" ;
import { Role } from 'src/app/core/domain/models/user.model';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  imports: [IonSpinner, RouterLink, IonTextarea, IonCheckbox, IonButton, IonIcon, IonText, IonAvatar, IonInput, IonInputPasswordToggle, IonLabel, IonSelect, IonSelectOption, ReactiveFormsModule]
})
export class RegisterFormComponent implements OnInit {
  //#userRepository = inject(UserRepository);
  fb: FormBuilder = inject(FormBuilder);
  emailValidator = new EmailValidator();
  usernameValidator = new UsernameValidator();
  registerForm!: FormGroup;
  //localErrorMessage = signal<string>('');

  step = input<number>(1);
  nextStep = output<void>();
  formSubmit = output<void>();

  submitAttempts = input<Record<string, WritableSignal<boolean>>>({ 
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    register: signal<boolean>(false)
  });

  loadingStates = input<Record<string, WritableSignal<boolean>>>({
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    register: signal<boolean>(false)
  });

  controlFocus = output<string>();
  controlBlur = output<string>();

  uploadAvatar = output<void>();

  authProviderErrorMessage = input<string>('');

  formattedDate = signal<string>(new Date().toLocaleDateString('es-ES'));

  avatarDataURL = input<string>('');

  countries = countries;
  roles: Role[] = [
    Role.Amateur,
    Role.Professional,
    Role.Collector,
    Role.Student
  ];

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, calendarOutline, globeOutline });
  }

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm() {
    this.registerForm = this.fb.group({
      emailData: this.fb.group({
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.emailValidator.validate()],
          updateOn: 'blur'
        }),
      }),
      userData: this.fb.group({
        username: this.fb.control('', {
          validators: [Validators.required, Validators.minLength(4)],
          asyncValidators: [this.usernameValidator.validate()],
          updateOn: 'blur'
        }),
        password: this.fb.control('', {
          validators: [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)],
          updateOn: 'blur'
        }),
      }),
      personalData: this.fb.group({
        firstName: this.fb.control('', { 
          validators: [Validators.required], 
          updateOn: 'blur' 
        }),
        lastName: this.fb.control('', { 
          validators: [Validators.required], 
          updateOn: 'blur' 
        }),
        address: this.fb.control('', { 
          validators: [Validators.required], 
          updateOn: 'blur' 
        }),
        zipcode: this.fb.control('', { 
          validators: [Validators.required, Validators.minLength(4)], 
          updateOn: 'blur' 
        }),
        country: this.fb.control('', { 
          validators: [Validators.required], 
          updateOn: 'blur' 
        }),
      }),
      otherData: this.fb.group({
        roles: this.fb.array([]),
        bio: this.fb.control('', /* [Validators.minLength(4)] */)
      })
    });
  }

  onRoleChange(event: any) {
    const roles: FormArray = this.registerForm.get('otherData.roles') as FormArray;
    if (event.detail.checked) {
      roles.push(this.fb.control(event.detail.value));
    } else {
      const index = roles.controls.findIndex(control => control.value === event.detail.value);
      if (index >= 0) roles.removeAt(index);
    }
  }
}
