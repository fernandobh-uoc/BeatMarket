import { Component, signal, input, output, computed, Signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { IonInput, IonSelect, IonSelectOption, IonInputPasswordToggle, IonButton, IonItem, IonList, IonLabel, IonAvatar, IonText, IonIcon, IonDatetime, IonModal, IonDatetimeButton, IonCheckbox, IonTextarea } from '@ionic/angular/standalone';

import { EmailValidator } from '../../utils/validators/email.validator';
import { UsernameValidator } from '../../utils/validators/username.validator';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircleOutline, closeCircleOutline, globeOutline } from 'ionicons/icons';

import countries from "../../utils/countries" ;
import { Role } from 'src/app/core/domain/models/user.model';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  imports: [IonTextarea, IonCheckbox, IonDatetimeButton, IonModal, IonDatetime, IonIcon, IonText, IonAvatar, IonInput, IonInputPasswordToggle, IonList, IonLabel, IonSelect, IonSelectOption, ReactiveFormsModule]
})
export class RegisterFormComponent {
  registerForm: FormGroup;
  //localErrorMessage = signal<string>('');

  submitAttempts = input<Record<string, WritableSignal<boolean>>>({ 
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    otherData: signal<boolean>(false)
  });
  errorMessages = input({ 
    email: signal<string>('')
  });

  //controlFocus = output<AbstractControl>();
  controlFocus = output<string>();
  //controlBlur = output<AbstractControl>();
  controlBlur = output<string>();

  //emailValid = computed(() => this.registerForm.get('email')?.valid ?? false);
  /* emailFocused = output<void>();
  emailBlur = output<void>(); */

  uploadAvatar = output<void>();
  formSubmitted = output<void>();

  formattedDate = signal<string>(new Date().toLocaleDateString('es-ES'));

  countries = countries;
  roles: Role[] = [
    Role.Amateur,
    Role.Professional,
    Role.Collector,
    Role.Student
  ];

  constructor(private fb: FormBuilder) {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, calendarOutline, globeOutline });

    this.registerForm = this.fb.group({
      emailData: this.fb.group({
        email: this.fb.control('', /* [Validators.required, Validators.email], [EmailValidator.validate()] */),
      }),
      userData: this.fb.group({
        username: this.fb.control('', /* [Validators.required, Validators.minLength(4)], [UsernameValidator.validate()] */),
        password: this.fb.control('', /* [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)] */),
      }),
      personalData: this.fb.group({
        firstName: this.fb.control('', /* [Validators.required] */),
        lastName: this.fb.control('', /* [Validators.required] */),
        dob: this.fb.control(this.formattedDate.set(new Date().toLocaleDateString('es-ES'))),
        address: this.fb.control('', /* [Validators.required] */),
        zipcode: this.fb.control('', /* [Validators.required, Validators.minLength(4)] */),
        country: this.fb.control('', /* [Validators.required] */),
      }),
      otherData: this.fb.group({
        roles: this.fb.array([]),
        bio: this.fb.control('', /* [Validators.minLength(4)] */)
      })
    });
  }

  /* onEmailFocus() {
    this.emailFocused.emit();
    this.registerForm.controls['email'].markAsUntouched();
  } */

  /* onControlFocus(control: any) {
    this.controlFocus.emit(control as AbstractControl);
  }

  onControlBlur(control: any) {
    this.controlBlur.emit(control as AbstractControl);
  } */

  onDateChange(event: any) {
    this.formattedDate.set(new Date(event.detail.value).toLocaleDateString('es-ES'));
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

  errorMessage = input<string>('');
  step = input<number>(1);
}
