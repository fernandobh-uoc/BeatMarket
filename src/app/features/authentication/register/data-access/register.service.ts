import { computed, ElementRef, inject, Injectable, Signal, signal, ViewChild, viewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { isUserModel, User, UserModel } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { CartService } from 'src/app/features/cart/data-access/cart.service';

type RegisterState = {
  profilePictureDataURL: string;
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private cache = inject(LocalStorageService);

  private profilePictureDataURL = signal<string | undefined | null>(null);

  private loading = signal<boolean>(false);
  private errorMessage = signal<string>('');

  registerState = computed<RegisterState>(() => ({
    profilePictureDataURL: this.profilePictureDataURL() ?? '',
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));

  getAvatarData = async (): Promise<void> => {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.profilePictureDataURL.set(image.dataUrl);
    } catch (error) {
      console.error(`Error al seleccionar avatar: ${error}`);
    }
  }

  setAvatarDataNotNative = (event: any): void => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.profilePictureDataURL.set(dataUrl);
    };

    reader.readAsDataURL(file);
  }

  removeProfilePicture = async (): Promise<void> => {
    this.profilePictureDataURL.set(null);
  }

  registerUser = async (userFormData: any): Promise<void> => {
    this.loading.set(true);
    
    try {
      const fcmToken = await this.cache.get<string | null>('fcmToken');
      const user: User | null = await this.authService.register({
        method: 'email',
        userData: {
          email: userFormData.email ?? '',
          username: userFormData.username ?? '',
          password: userFormData.password ?? '',
          name: {
            first: userFormData.firstName ?? '',
            last: userFormData.lastName ?? ''
          },
          address: {
            line1: userFormData.address ?? '',
            city: userFormData.city ?? '',
            country: userFormData.country ?? '',
            zipcode: userFormData.zipcode ?? ''
          },
          roles: userFormData.roles ?? [],
          bio: userFormData.bio ?? '',
          fcmToken: fcmToken,
          profilePictureDataURL: this.profilePictureDataURL() ?? '',
        }
      });

      // Create cart for the user (before user has logged in)
      if (isUserModel(user)) {
        await this.cartService.createCart(user._id);
      }

      this.loading.set(false);
      this.errorMessage.set('');
    } catch (errorMessage: any) {
      console.error(errorMessage);
      this.loading.set(false);
      this.errorMessage.set(errorMessage);
    }
  }
}
