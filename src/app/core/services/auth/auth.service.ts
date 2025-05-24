import { EnvironmentInjector, Injectable, inject, runInInjectionContext, signal, computed, effect  } from '@angular/core'; 
import { Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { Auth, AuthProvider, AuthReturnType, UserAuthData } from './auth.interface';
import { UserRepository } from '../../domain/repositories/user.repository'; 
import { User, UserModel, isUserModel } from 'src/app/core/domain/models/user.model';
import { LocalStorageService } from '../../storage/local-storage.service';
import { CloudStorage } from '../cloud-storage/cloudStorage.interface';
import { dataUrlToBlob } from 'src/app/shared/utils/file.service';


type AuthState = {
  isAuthenticated: boolean,
  userId: string,
  currentUser: UserModel | null,
  errorMessage: string | null,
}

export type CacheAuthState = {
  isAuthenticated: boolean,
  userId: string,
  username: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private injector = inject(EnvironmentInjector);
  private userRepository = inject(UserRepository);
  private cloudStorage = inject(CloudStorage);
  private cache = inject(LocalStorageService);
  private authMethod!: AuthMethod;
  
  private errorMessage = signal<string | null>(null);
  
  private userId = signal<string | undefined>(undefined);
  private _currentUser = rxResource<User | null, string | undefined>({
    request: () => this.userId(),
    loader: ({ request: userId }): Observable<User | null> => {
      if (!userId) return of(null);

      try {
        const user$ = this.userRepository.getUserById$(userId);
        return user$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  });

  authState = computed<AuthState>(() => ({
    isAuthenticated: Boolean(this._currentUser.value()),
    userId: this._currentUser.value()?._id ?? '',
    currentUser: this._currentUser.value() ?? null,
    errorMessage: this.errorMessage()
  }))

  // Direct accessor to currentUser for QoL
  currentUser = computed<User | null>(() => this._currentUser.value() ?? null);

  constructor() {
    effect(async () => {
      await this.cache.set('authState', {
        isAuthenticated: this.authState().isAuthenticated,
        userId: this.authState().currentUser?._id ?? '',
        username: this.authState().currentUser?.username ?? ''
      })
      
    })
  };

  init = async (): Promise<void> => {
    try {
      await this.loadUserFromCache();
    } catch (error) {
      console.error(error);
    }
  }

  private setUserId(userId: string | undefined): void {
    this.userId.set(userId);
  }

  private setAuthMethod(method: 'email' | 'google' | 'apple') {
    runInInjectionContext(this.injector, () => {
      if (method === 'email' && !(this.authMethod instanceof EmailAuth)) {
        this.authMethod = inject(EmailAuth);
      }
      if (method === 'google' && !(this.authMethod instanceof GoogleAuth)) {
        this.authMethod = inject(GoogleAuth);
      }
      if (method === 'apple' && !(this.authMethod instanceof AppleAuth)) {
        this.authMethod = inject(AppleAuth);
      }
    });
  }

  private isUidObject(value: any): value is { uid: string } {
    return value && typeof value === 'object' && value.uid && typeof value.uid === 'string';
  }

  #uploadProfilePicture = async ({ profilePictureDataUrl, uid }: { profilePictureDataUrl: string, uid: string }): Promise<string | void> => {
    try {
      return await this.cloudStorage.upload(`profilePictures/${uid}`, dataUrlToBlob(profilePictureDataUrl));
    } catch (error) {
      throw error;
    }
  }

  #getDefaultProfilePictureURL = async (): Promise<string | void> => {
    try {
      return await this.cloudStorage.getDownloadURL(`profilePictures/default.webp`);
    } catch (error) {
      throw error;
    }
  }

  async register({ method, userData }: { method: 'email' | AuthProvider, userData: UserAuthData }): Promise<User | null> {
    this.setAuthMethod(method);
    
    try {
      // Register with auth provider
      const result = await this.authMethod.register({
        email: userData.email,
        password: userData.password,
        username: userData.username
      });

      if (this.isUidObject(result)) {
        userData._id = result.uid;
      }
      
      // Upload profile picture
      if (userData.profilePictureDataURL && userData._id) {
        userData.profilePictureURL = await this.#uploadProfilePicture({
            profilePictureDataUrl: userData.profilePictureDataURL,
            uid: userData._id 
        }) ?? '';
        delete userData.profilePictureDataURL;
      } else {
        userData.profilePictureURL = await this.#getDefaultProfilePictureURL() ?? '';
      }

      let { password, ...userDataWithoutPassword } = userData;
      
      // Save to storage
      return await this.userRepository.saveUser(userDataWithoutPassword);
      
    } catch (errorMessage: any) {
      this.errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async login({ method, credentials }: { method: 'email' | AuthProvider, credentials?: { email: string, password: string } }): Promise<void> {
    this.setAuthMethod(method);
    
    try {
      const result = await this.authMethod.login(credentials?.email, credentials?.password);
      
      // Static user, return it
      if (isUserModel(result)) {
        //return result as User;
        this.setUserId(result._id);
        return;
      }

      if (!this.isUidObject(result)) {
        return;
      }

      this.setUserId(result.uid);   // Activate rxResourceLoader
    } catch (errorMessage: any) {
      this.errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async logout(): Promise<void> {
    this.setAuthMethod('email');
    try {
      await this.authMethod.logout();
      this.setUserId(undefined);  // Deactivate rxResourceLoader
      this._currentUser.set(null);
    } catch (errorMessage: any) {
      this.errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.setAuthMethod('email');
    try {
      await this.authMethod.updatePassword(newPassword);
    } catch (errorMessage: any) {
      this.errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async resetPassword(email: string): Promise<void> {
    this.setAuthMethod('email');
    try {
      await this.authMethod.resetPassword(email);
    } catch (errorMessage: any) {
      this.errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  private async loadUserFromCache(): Promise<void> {
    const cacheState = await this.cache.get<CacheAuthState>('authState');

    if (cacheState != null && cacheState.isAuthenticated) {
      this.setUserId(cacheState.userId);   // Activate rxResourceLoader
      while (!this._currentUser.hasValue()) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }
}

export interface AuthMethod {
  register(userData: UserAuthData): Promise<AuthReturnType>;
  login(email?: string, password?: string): Promise<AuthReturnType>;
  logout(): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

abstract class CommonAuth implements AuthMethod {
  protected auth = inject(Auth);

  abstract register(userData: UserAuthData): Promise<AuthReturnType>;
  abstract login(email?: string, password?: string): Promise<AuthReturnType>;

  async logout(): Promise<void> {
    try {
      return await this.auth.logout();
    } catch (authError: any) {
      throw authError;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      return await this.auth.updatePassword(newPassword);
    } catch (authError: any) {
      throw authError;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return await this.auth.resetPassword(email);
    } catch (authError: any) {
      throw authError;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class EmailAuth extends CommonAuth implements AuthMethod {
  async register(userData: UserAuthData): Promise<AuthReturnType> {
    try {
      return await this.auth.registerWithEmail(userData);
    } catch (authError: any) {
      throw authError;
    }
  }

  async login(email: string, password: string): Promise<AuthReturnType> {
    try {
      return await this.auth.loginWithEmail(email, password);
    } catch (authError: any) {
      throw authError;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuth extends CommonAuth implements AuthMethod {
  async register(): Promise<AuthReturnType> {
    try {
      return await this.auth.registerWithProvider('google');
    } catch (authError: any) {
      throw authError;
    }
  }

  async login(): Promise<AuthReturnType> {
    try {
      return await this.auth.loginWithProvider('google');
    } catch (authError: any) {
      throw authError;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class AppleAuth extends CommonAuth implements AuthMethod {
  async register(): Promise<AuthReturnType> {
    try {
      return await this.auth.loginWithProvider('apple');
    } catch (authError: any) {
      throw authError;
    }
  }

  async login(): Promise<AuthReturnType> {
    try {
      return await this.auth.loginWithProvider('apple');
    } catch (authError: any) {
      throw authError;
    }
  }
}