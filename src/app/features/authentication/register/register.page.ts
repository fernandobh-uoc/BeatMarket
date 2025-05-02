import { Component, computed, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { filter, last } from 'rxjs/operators';

import { IonBackButton, IonButton, IonProgressBar, IonButtons, IonContent, IonHeader, IonIcon, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { RegisterFormComponent } from './ui/register-form/register-form.component';
import { FormGroup } from '@angular/forms';
import { RegisterService } from './data-access/register.service';
import { UserModel } from 'src/app/core/domain/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonContent, IonHeader, IonProgressBar, IonText, IonIcon, IonButtons, IonBackButton, IonTitle, IonToolbar, IonButton, HeaderComponent, RegisterFormComponent]
})
export class RegisterPage {
  #registerService = inject(RegisterService);

  constructor() {
    addIcons({ arrowBackOutline });
  }

  step = signal<number>(4);
  totalSteps = 4;
  progress = computed(() => (this.step() / this.totalSteps));

  registerFormComponent = viewChild(RegisterFormComponent);
  //registerForm: FormGroup<any> | undefined = this.registerFormComponent()?.registerForm;

  submitAttempts: Record<string, WritableSignal<boolean>> = {
    'email': signal<boolean>(false),
    'userData': signal<boolean>(false),
    'personalData': signal<boolean>(false),
    'otherData': signal<boolean>(false)
  };

  disabledNextButtons = {
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    otherData: signal<boolean>(false)
  }

  onControlFocus(control: string) {
    this.submitAttempts['email'].set(false);
    this.submitAttempts['userData'].set(false);
    this.submitAttempts['personalData'].set(false);
    this.submitAttempts['otherData'].set(false);
  }

  nextStep = async () => {
    if (this.step() === 1) {
      this.submitAttempts['email'].set(true);
      this.#handleNextStepEmail(this.registerFormComponent()?.registerForm);
    }

    if (this.step() === 2) {
      this.submitAttempts['userData'].set(true);
      this.#handleNextStepUserData(this.registerFormComponent()?.registerForm);
    }

    if (this.step() === 3) {
      this.submitAttempts['personalData'].set(true);
      this.#handleNextStepPersonalData(this.registerFormComponent()?.registerForm);
    }
  }

  prevStep = () => {
    this.step.set(this.step() - 1);
  }

  onAvatarUpload = () => {
    this.#registerService.getAvatarData();
  }

  errorMessages = {
    email: signal<string>(''),
  }

  #handleNextStepEmail = async (registerForm: FormGroup<any> | undefined) => {
    const emailControl = registerForm?.get('emailData.email');
    if (!emailControl) return;

    emailControl?.updateValueAndValidity();

    if (emailControl.pending) {
      this.disabledNextButtons.email.set(true);
      await firstValueFrom(
        emailControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.disabledNextButtons.email.set(false);
    }

    if (registerForm?.get('emailData')?.valid) {
      this.step.set(this.step() + 1);
      return;
    }
  }

  #handleNextStepUserData = async (registerForm: FormGroup<any> | undefined) => {
    const usernameControl = registerForm?.get('userData.username');
    const passwordControl = registerForm?.get('userData.password');
    if (!usernameControl || !passwordControl) return;

    usernameControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();

    if (usernameControl.pending) {
      this.disabledNextButtons.userData.set(true);
      await firstValueFrom(
        usernameControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.disabledNextButtons.userData.set(false);
    }

    /* if (usernameControl.valid && passwordControl.valid) {
      this.step.set(this.step() + 1);
    } */
    if (registerForm?.get('userData')?.valid) {
      this.step.set(this.step() + 1);
    }
  }

  #handleNextStepPersonalData = async (registerForm: FormGroup<any> | undefined) => {
    const firstNameControl = registerForm?.get('personalData.firstName');
    const lastNameControl = registerForm?.get('personalData.lastName');
    const dobControl = registerForm?.get('personalData.dob');
    const addressControl = registerForm?.get('personalData.address');
    const zipcodeControl = registerForm?.get('personalData.zipcode');
    const countryControl = registerForm?.get('personalData.country');

    if (!firstNameControl || !lastNameControl || !dobControl || !addressControl || !zipcodeControl || !countryControl) return;

    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
    dobControl?.updateValueAndValidity();
    addressControl?.updateValueAndValidity();
    zipcodeControl?.updateValueAndValidity();
    countryControl?.updateValueAndValidity();

    if (firstNameControl.pending) {
      this.disabledNextButtons.personalData.set(true);
      await firstValueFrom(
        firstNameControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.disabledNextButtons.personalData.set(false);
    }

    if (registerForm?.get('personalData')?.valid) {
      this.step.set(this.step() + 1);
    }
  }


  async handleRegister(): Promise<void> {
    const dummyUserData = {
      email: 'fernando2@gmail.com',
      username: 'fernando',
      password: '123456',
      firstName: 'Fernando',
      lastName: 'Hernandez',
      dob: new Date(),
      address: 'Calle de la Paz, 1',
      zipcode: '28001',
      country: 'España',
      roles: ['Student', 'Professional'],
    }
    this.#registerService.registerUser(dummyUserData);

    /*const registerForm: FormGroup<any> | undefined = this.registerFormComponent()?.registerForm;
    this.#registerService.registerUser({
      ...this.registerForm?.value.emailData,
      ...this.registerForm?.value.userData,
      ...this.registerForm?.value.personalData,
      ...this.registerForm?.value.otherData
    }); */
  }

  /* checkEmailValidity() {
    this.emailValid.set(this.registerFormComponent()?.registerForm?.get('email')?.valid ?? false);
    console.log(`email validity: ${this.emailValid()}`)
  } */
}
