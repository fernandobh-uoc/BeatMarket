import { ElementRef, inject, Injectable, Signal, signal, ViewChild, viewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  #authService = inject(AuthService);
  profilePictureDataURL: string | undefined | null = null;

  #errorMessage = signal<string>('');

  get errorMessage() {
    return this.#errorMessage.asReadonly();
  }

  getAvatarData = async () => {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.profilePictureDataURL = image.dataUrl;
    } catch (error) {
      console.error(`Error al seleccionar avatar: ${error}`);
    }
  }

  setAvatarDataNotNative = (event: any) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.profilePictureDataURL = dataUrl;
    };

    reader.readAsDataURL(file);
  }

  registerUser = async (userFormData: any) => {
    //console.log(userFormData);
    try {
      await this.#authService.register({
        method: 'email',
        userData: {
          email: userFormData.email ?? '',
          username: userFormData.username ?? '',
          password: userFormData.password ?? '',
          name: {
            first: userFormData.firstName ?? '',
            last: userFormData.lastName ?? ''
          },
          dateOfBirth: userFormData.dob ?? '',
          address: {
            line1: userFormData.address ?? '',
            city: userFormData.city ?? '',
            country: userFormData.country ?? '',
            zipcode: userFormData.zipcode ?? ''
          },
          roles: userFormData.roles ?? [],
          bio: userFormData.bio ?? '',
          profilePictureDataURL: this.profilePictureDataURL ?? '',
        }
      })
    } catch (errorMessage: any) {
      console.error(errorMessage);
      this.#errorMessage.set(errorMessage);
    }
  }

  register = () => {

  }

  saveNewUser = () => {

  }
}
