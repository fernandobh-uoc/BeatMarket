import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { User, UserModel } from 'src/app/core/domain/models/user.model';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';

type UserDetailState = {
  userData: UserModel | null,
  loading: boolean,
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class UserDetailService {
  private userRepository = inject(UserRepository);

  private errorMessage = signal<string>('');

  private userId = signal<string | undefined>(undefined);
  private userResource = rxResource<UserModel | null, string | undefined>({
    request: () => this.userId(),
    loader: ({ request: userId }): Observable<UserModel | null> => {
      if (!userId) return of(null);

      try {
        const user$ = this.userRepository.getUserById$(userId);
        return user$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  })

  userDetailState = computed<UserDetailState>(() => ({
    userData: this.userResource.value() ?? null,
    loading: this.userResource.isLoading(),
    errorMessage: this.errorMessage()
  }));

  setUserId(userId: string): void {
    this.userId.set(userId);
  }

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
