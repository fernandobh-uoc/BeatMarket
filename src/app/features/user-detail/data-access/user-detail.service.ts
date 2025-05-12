import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/domain/models/user.model';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';

@Injectable({
  providedIn: 'root'
})
export class UserDetailService {
  private userRepository = inject(UserRepository);

  errorMessage = signal<string>('');

  constructor() { }

  async getUserData (userId: string): Promise<User | null> {
    try {
      return await this.userRepository.getUserById(userId);
    } catch (storageError) {
      console.error(storageError);
      this.errorMessage.set(storageError as string);
      throw storageError;
    }
  }

  async getUserData$(userId: string): Promise<Observable<User | null> | null> {
    if (!this.userRepository.getUserById$) return null;
    try {
      return this.userRepository.getUserById$(userId);
    } catch (storageError) {
      console.error(storageError);
      this.errorMessage.set(storageError as string);
      throw storageError;
    }
  }
}
