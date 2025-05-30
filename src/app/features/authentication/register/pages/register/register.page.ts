import { Component, computed, ElementRef, inject, signal, viewChild, WritableSignal, Signal, linkedSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { filter } from 'rxjs/operators';

import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

import { RegisterFormComponent } from '../../ui/register-form/register-form.component';
import { FormGroup } from '@angular/forms';
import { RegisterService } from '../../data-access/register.service';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';

import { ViewDidLeave } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [ToolbarComponent, IonContent, IonHeader, RegisterFormComponent]
})
export class RegisterPage implements ViewDidLeave {
  private router = inject(Router);
  private registerService = inject(RegisterService);
  
  constructor() {
    addIcons({ arrowBackOutline });
  }

  registerFormComponent = viewChild(RegisterFormComponent);

  step = signal<number>(1);
  totalSteps = 4;
  progressBarValue = computed(() => (this.step() / this.totalSteps));

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

  ionViewDidLeave(): void {
    this.registerService.removeProfilePicture();
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
      this.handleNextStepEmail(this.registerFormComponent()?.registerForm);
      return;
    }

    if (this.step() === 2) {
      this.submitAttempts['userData'].set(true);
      this.handleNextStepUserData(this.registerFormComponent()?.registerForm);
      return;
    }

    if (this.step() === 3) {
      this.submitAttempts['personalData'].set(true);
      this.handleNextStepPersonalData(this.registerFormComponent()?.registerForm);
      return;
    }
  }

  prevStep = () => {
    this.step.set(this.step() - 1);
  }

  resetForm = () => {
    this.registerFormComponent()?.registerForm.reset();
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

  private handleNextStepEmail = async (registerForm: FormGroup<any> | undefined) => {
    const emailControl = registerForm?.get('emailData.email');
    if (!emailControl) return;

    emailControl?.updateValueAndValidity();

    if (emailControl.pending) {
      this.loadingStates.email.set(true);
      await firstValueFrom(
        emailControl.statusChanges.pipe(
          filter(status => status !== 'PENDING')
        )
      );
      this.loadingStates.email.set(false);
    }

    if (registerForm?.get('emailData')?.valid) {
      this.step.set(this.step() + 1);
      return;
    }
  }

  private handleNextStepUserData = async (registerForm: FormGroup<any> | undefined) => {
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

  private handleNextStepPersonalData = async (registerForm: FormGroup<any> | undefined) => {
    const firstNameControl = registerForm?.get('personalData.firstName');
    const lastNameControl = registerForm?.get('personalData.lastName');
    const addressControl = registerForm?.get('personalData.address');
    const cityControl = registerForm?.get('personalData.city');
    const zipcodeControl = registerForm?.get('personalData.zipcode');
    const countryControl = registerForm?.get('personalData.country');

    if (!firstNameControl || !lastNameControl || !addressControl || !cityControl || !zipcodeControl || !countryControl) return;

    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
    addressControl?.updateValueAndValidity();
    
    cityControl?.updateValueAndValidity();
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
      this.resetForm();
      this.step.set(1);
      this.router.navigate(['/auth/welcome']);
    }
  }
}
