import { effect, inject, Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { AuthService, CacheAuthState } from 'src/app/core/services/auth/auth.service';
import { CloudStorage } from 'src/app/core/services/cloud-storage/cloudStorage.interface';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { dataUrlToBlob } from 'src/app/shared/utils/file.service';

@Injectable()
export class ProfileService {
  private userRepository = inject(UserRepository);
  private authService = inject(AuthService);
  private cloudStorage = inject(CloudStorage);
  private cache = inject(LocalStorageService);

  newProfilePictureDataURL = signal<string | undefined | null>(null);
  pending = signal<boolean>(false);
  editingInputStates = signal<Record<string, boolean>[]>([]);

  storageErrorMessage = signal<string>('');
  usernameErrorMessage = signal<string>('');
  passwordUpdateSuccessMessage = signal<string>('');

  constructor() {}

  async editUserData(key: string, data: string | number | object | null | undefined): Promise<boolean> {
    this.pending.set(true);

    try {
      if (key === 'username') {
        if (await this.usernameExists(data as string)) {
          this.usernameErrorMessage.set('Ese nombre de usuario ya está en uso');
          this.pending.set(false);
          return false;
        }
      }

      if (key === 'password') {
        await this.authService.updatePassword(data as string);
        this.passwordUpdateSuccessMessage.set('Contraseña actualizada');
        this.resetEditingInputStates();
        this.pending.set(false);
        setTimeout(() => {
          this.passwordUpdateSuccessMessage.set('');
        }, 2000);
        return true;
      }

      if (key === 'line1' || key === "city" || key === 'country' || key === 'zipcode') {
        data = {
          ...this.authService.currentUser()?.address,
          [key]: data as string
        };
        key = 'address';
      }

      if (key === 'first' || key === 'last') {
        data = {
          ...this.authService.currentUser()?.name,
          [key]: data as string
        };
        key = 'name';
      }

      this.userRepository.updateUser({
        _id: (await this.cache.get<CacheAuthState>('authState'))?.userId ?? '',
        [key]: data as string
      });

      if (key === 'username') {
        this.cache.set('authState', { ...(await this.cache.get<CacheAuthState>('authState')), username: data as string });
      }

      this.resetEditingInputStates();
      this.pending.set(false);

      return true;

    } catch (storageError) {
      this.storageErrorMessage.set(storageError as string);
      this.pending.set(false);
      return false;
    }
  }

  async getAvatarData(): Promise<void> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.newProfilePictureDataURL.set(image.dataUrl);
    } catch (error) {
      console.error(`Error al seleccionar avatar: ${error}`);
    }
  }

  setAvatarDataNotNative = async (event: any): Promise<void> => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const dataUrl = await this.readFileAsDataURL(file);

    this.newProfilePictureDataURL.set(dataUrl);
  };

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  saveNewProfilePictureDataURL = async (): Promise<boolean> => {
    try {
      const userId = this.authService.currentUser()?._id;
      if (!userId) return false;

      const downloadURL = this.newProfilePictureDataURL();
      if (!downloadURL) return false;

      if (!this.authService.currentUser()?.profilePictureURL.includes('default')) {
        await this.removeProfilePicture(userId);
      }

      const profilePictureDataURL = await this.uploadProfilePicture({
        profilePictureDataUrl: downloadURL,
        uid: userId
      }) ?? '';

      if (profilePictureDataURL) {
        this.userRepository.updateUser({
          _id: userId,
          profilePictureURL: profilePictureDataURL
        });

        this.newProfilePictureDataURL.set(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error al guardar avatar: ${error}`);
      return false;
    }
  }

  private removeProfilePicture = async (uid: string): Promise<boolean> => {
    try {
      await this.cloudStorage.delete(`profilePictures/${uid}`);
    } catch (error) {
      console.error(`Error al eliminar avatar: ${error}`);
    }

    return false;
  }

  private uploadProfilePicture = async ({ profilePictureDataUrl, uid }: { profilePictureDataUrl: string, uid: string }): Promise<string | void> => {
    try {
      return await this.cloudStorage.upload(`profilePictures/${uid}`, dataUrlToBlob(profilePictureDataUrl));
    } catch (error) {
      throw error;
    }
  }

  resetEditingInputStates() {
    const updatedEditingInputStates = this.editingInputStates().map(record => {
      const updatedRecord: Record<string, boolean> = {};
      for (const key in record) {
        if (record.hasOwnProperty(key)) {
          updatedRecord[key] = false;
        }
      }
      return updatedRecord;
    });

    this.editingInputStates.set(updatedEditingInputStates);
  }

  removeErrorMessages() {
    this.usernameErrorMessage.set('');
  }

  async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.userRepository.getUserByUsername(username);
      return Boolean(user);
    } catch (storageError) {
      this.usernameErrorMessage.set(storageError as string);
      return false;
    }
  }
}
