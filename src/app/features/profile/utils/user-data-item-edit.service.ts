import { effect, inject, Injectable, signal } from '@angular/core';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { AuthService, CacheAuthState } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

@Injectable()
export class UserDataItemEditService {
  private userRepository = inject(UserRepository);
  private authService = inject(AuthService);
  private cache = inject(LocalStorageService);

  editNewData = signal<Record<string, string>>({});
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

      if (key === 'avatar') {}

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

  async updateUser() {

  }
}
