import { inject, Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { UserModel } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  #authService = inject(AuthService);
  avatarDataUrl: string | undefined | null = null;

  getAvatarData = async () => {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.avatarDataUrl = image.dataUrl;
    } catch (error) {
      console.error(`Error al seleccionar avatar: ${error}`);
    }
  }

  registerUser = (userFormData: any) => {
    //console.log(userFormData);
    this.#authService.register({
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
        profilePictureDataURL: this.avatarDataUrl ?? 'default',
      }
    })
  }

  register = () => {

  }

  saveNewUser = () => {

  }
}
