import { Component, computed, ElementRef, inject, signal, effect, ViewChild, viewChild, WritableSignal, Signal, linkedSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { filter, last } from 'rxjs/operators';

import { IonBackButton, IonButton, IonProgressBar, IonButtons, IonContent, IonHeader, IonIcon, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { RegisterFormComponent } from '../../ui/register-form/register-form.component';
import { FormGroup } from '@angular/forms';
import { RegisterService } from '../../data-access/register.service';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonContent, IonHeader, IonProgressBar, IonIcon, IonButtons, IonBackButton, IonTitle, IonToolbar, IonButton, RegisterFormComponent]
})
export class RegisterPage {
  private router = inject(Router);
  private registerService = inject(RegisterService);
  
  constructor() {
    addIcons({ arrowBackOutline });
  }

  registerFormComponent = viewChild(RegisterFormComponent);

  step = signal<number>(1);
  totalSteps = 4;
  progress = computed(() => (this.step() / this.totalSteps));

  errorMessage = computed(() => this.registerService.registerState().errorMessage);
  profilePictureDataURL = computed(() => this.registerService.registerState().profilePictureDataURL);
  
  submitAttempts: Record<string, WritableSignal<boolean>> = {
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    register: signal<boolean>(false)
  };

  loadingStates = {
    email: signal<boolean>(false),
    userData: signal<boolean>(false),
    personalData: signal<boolean>(false),
    register: linkedSignal<boolean>(() => this.registerService.registerState().loading)
  }

  onControlFocus(control: string) {
    this.submitAttempts['email'].set(false);
    this.submitAttempts['userData'].set(false);
    this.submitAttempts['personalData'].set(false);
    this.submitAttempts['register'].set(false);
  }

  nextStep = () => {
    if (this.step() === 1) {
      this.submitAttempts['email'].set(true);
      this.#handleNextStepEmail(this.registerFormComponent()?.registerForm);
      return;
    }

    if (this.step() === 2) {
      this.submitAttempts['userData'].set(true);
      this.#handleNextStepUserData(this.registerFormComponent()?.registerForm);
      return;
    }

    if (this.step() === 3) {
      this.submitAttempts['personalData'].set(true);
      this.#handleNextStepPersonalData(this.registerFormComponent()?.registerForm);
      return;
    }
  }

  prevStep = () => {
    this.step.set(this.step() - 1);
  }

  fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild('fileInput');
  onAvatarUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      await this.registerService.getAvatarData();
    } else {
      // Activate hidden file input
      this.fileInput()?.nativeElement.click();
    }
  }

  // Not native platform only
  handleFileInput = (event: any) => {
    this.registerService.setAvatarDataNotNative(event);
  }

  #handleNextStepEmail = async (registerForm: FormGroup<any> | undefined) => {
    const emailControl = registerForm?.get('emailData.email');
    if (!emailControl) return;

    emailControl?.updateValueAndValidity();

    if (emailControl.pending) {
      //this.disabledNextButtons.email.set(true);
      this.loadingStates.email.set(true);
      await firstValueFrom(
        emailControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      //this.disabledNextButtons.email.set(false);
      this.loadingStates.email.set(false);
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
      this.loadingStates.userData.set(true);
      await firstValueFrom(
        usernameControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.loadingStates.userData.set(false);
    }

    if (registerForm?.get('userData')?.valid) {
      this.step.set(this.step() + 1);
    }
  }

  #handleNextStepPersonalData = async (registerForm: FormGroup<any> | undefined) => {
    const firstNameControl = registerForm?.get('personalData.firstName');
    const lastNameControl = registerForm?.get('personalData.lastName');
    const addressControl = registerForm?.get('personalData.address');
    const zipcodeControl = registerForm?.get('personalData.zipcode');
    const countryControl = registerForm?.get('personalData.country');

    if (!firstNameControl || !lastNameControl /* || !dobControl */ || !addressControl || !zipcodeControl || !countryControl) return;

    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
    addressControl?.updateValueAndValidity();
    zipcodeControl?.updateValueAndValidity();
    countryControl?.updateValueAndValidity();

    if (firstNameControl.pending) {
      this.loadingStates.personalData.set(true);
      await firstValueFrom(
        firstNameControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.loadingStates.personalData.set(false);
    }

    if (registerForm?.get('personalData')?.valid) {
      this.step.set(this.step() + 1);
    }
  }

  async handleRegister(): Promise<void> {
    const registerForm: FormGroup<any> | undefined = this.registerFormComponent()?.registerForm;

    await this.registerService.registerUser({
      ...registerForm?.value.emailData,
      ...registerForm?.value.userData,
      ...registerForm?.value.personalData,
      ...registerForm?.value.otherData
    });

    if (!this.errorMessage()) {
      this.router.navigate(['/auth/welcome']);
    }
  }
}
