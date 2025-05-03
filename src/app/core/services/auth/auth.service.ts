import { EnvironmentInjector, Inject, Injectable, InjectionToken, Provider, Signal, Type, WritableSignal, effect, inject, runInInjectionContext, signal, untracked } from '@angular/core';
import { UserRepository } from '../../domain/repositories/user.repository'; 
import { Role, User, UserModel, isUserModel } from 'src/app/core/domain/models/user.model';
import { Auth, AuthProvider, AuthReturnType, UserAuthData } from './adapters/auth.interface';
import { environment } from 'src/environments/environment.dev';
import { LocalStorageService } from '../storage/local-storage.service';
import { CloudStorage } from '../cloud-storage/cloudStorage.interface';
import { user } from '@angular/fire/auth';

import { dataUrlToBlob } from 'src/app/shared/utils/file.service';
import { firstValueFrom, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface AuthStatus {
  isAuthenticated: boolean,
  userRoles: Role[],
  userId: string,
}

const defaultAuthStatus: AuthStatus = {
  isAuthenticated: false,
  userRoles: [],
  userId: ''
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  #currentUser = signal<User | null>(null);
  #authStatus = signal<AuthStatus>(defaultAuthStatus);

  #authMethod!: AuthMethod;
  #errorMessage = signal<string | null>(null);

  #userRepository = inject(UserRepository);
  #cloudStorage = inject(environment.cloudStorageToken);
  #cache = inject(LocalStorageService);

  constructor(
    private injector: EnvironmentInjector,
    /* private userRepository: UserRepository,
    private cache: LocalStorageService */
  ) {};

  get currentUser() {
    return this.#currentUser.asReadonly();
  }

  get authStatus() {
    return this.#authStatus.asReadonly();
  }

  get errorMessage() {
    return this.#errorMessage.asReadonly();
  }

  init = async (): Promise<void> => {
    try {
      await this.#loadUserFromStorage();
    } catch (error) {
      console.error(error);
    }
  }

  #setAuthMethod(method: 'email' | 'google' | 'apple') {
    runInInjectionContext(this.injector, () => {
      if (method === 'email' && !(this.#authMethod instanceof EmailAuth)) {
        this.#authMethod = inject(EmailAuth);
      }
      if (method === 'google' && !(this.#authMethod instanceof GoogleAuth)) {
        this.#authMethod = inject(GoogleAuth);
      }
      if (method === 'apple' && !(this.#authMethod instanceof AppleAuth)) {
        this.#authMethod = inject(AppleAuth);
      }
    });
  }

  #isUidObject(value: any): value is { uid: string } {
    return value && typeof value === 'object' && value.uid && typeof value.uid === 'string';
  }

  #uploadProfilePicture = async ({ profilePictureDataUrl, uid }: { profilePictureDataUrl: string, uid: string }): Promise<string | void> => {
    try {
      return await this.#cloudStorage.upload(`profilePictures/${uid}/avatar`, dataUrlToBlob(profilePictureDataUrl));
    } catch (error) {
      throw error;
    }
  }

  #getDefaultProfilePictureURL = async (): Promise<string | void> => {
    try {
      return await this.#cloudStorage.getDownloadURL(`profilePictures/default.webp`);
    } catch (error) {
      throw error;
    }
  }

  async register({ method, userData }: { method: 'email' | AuthProvider, userData: UserAuthData }): Promise<User | null | void> {
    this.#setAuthMethod(method);
    
    try {
      // Register with auth provider
      const result = await this.#authMethod.register({
        email: userData.email,
        password: userData.password,
        username: userData.username
      });

      if (this.#isUidObject(result)) {
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
      await this.#userRepository.saveUser(userDataWithoutPassword);

      //let user: User | boolean | null = null;
      //if (user = await this.#userRepository.saveUser(userDataWithoutPassword) && user) {
      //  this.#currentUser.set(user);
      //  this.#updateAuthStatus(user);
      //};
      
    } catch (errorMessage: any) {
      this.#errorMessage.set(errorMessage);
      throw errorMessage;
    }
    //return this.#currentUser();
  }

  async login({ method, credentials }: { method: 'email' | AuthProvider, credentials?: { email: string, password: string } }): Promise<User | null | void> {
    this.#setAuthMethod(method);
    let user$: Observable<User | null> | null = null;

    try {
      const result = await this.#authMethod.login(credentials?.email, credentials?.password);
      if (this.#isUidObject(result)) {
        user$ = this.#userRepository.getUserById$(result.uid);
      }
      if (result instanceof Observable) {
        user$ = result;
      }
      if (isUserModel(result)) {
        // TODO: Handle when provider returns a static user
      }

      if (user$) {
        /* runInInjectionContext(this.injector, () => {
          this.currentUser = toSignal(user$!);
          console.log({ currentUser: this.currentUser() });
          this.#updateAuthStatus(this.currentUser() ?? null);
        }); */
        user$.subscribe(user => {
          this.#currentUser.set(user);
        });
        this.#updateAuthStatus(await firstValueFrom(user$));
      }
    } catch (errorMessage: any) {
      this.#errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async logout(): Promise<void> {
    this.#setAuthMethod('email');
    try {
      await this.#authMethod.logout();
      this.#currentUser.set(null);
      this.#authStatus.set(defaultAuthStatus);
      await this.#cache.set('authStatus', this.#authStatus());
    } catch (errorMessage: any) {
      this.#errorMessage.set(errorMessage);
      throw errorMessage;
    }
  }

  async #updateAuthStatus(user: User | null): Promise<void> {
    if (user) {
      this.#authStatus.set({
        isAuthenticated: true,
        userId: user._id,
        userRoles: user.roles
      });
      await this.#cache.set('authStatus', this.#authStatus());
    }
  }

  async #loadUserFromStorage(): Promise<User | null | void> {
    const authStatus: AuthStatus | null = await this.#cache.get<AuthStatus>('authStatus');
    if (authStatus != null && authStatus.isAuthenticated) {
      const id: string = authStatus.userId;
      const user$ = this.#userRepository.getUserById$(id);
      if (user$) {
        user$.subscribe(user => {
          this.#currentUser.set(user);
        });

        this.#updateAuthStatus(await firstValueFrom(user$)); // Wait for the user to be loaded before the app starts
      }
    }
  }
}

export interface AuthMethod {
  register(userData: UserAuthData): Promise<AuthReturnType>;
  login(email?: string, password?: string): Promise<AuthReturnType>;
  logout(): Promise<void>;
}

/* @Injectable({ providedIn: 'root' })
export abstract class AuthMethod {
  constructor(@Inject(environment.authToken) protected auth: Aut?.emah) {};
  abstract register(userData: UserData): Promise<User | null>;
  abstract login(email?: string, password?: string): Promise<User | null>;
  abstract logout(): Promise<void>;
} */

@Injectable({ providedIn: 'root' })
export class EmailAuth implements AuthMethod {
  //constructor(@Inject(FIREBASE_AUTH_TOKEN) private auth: Auth) {}
  constructor(@Inject(environment.authToken) private auth: Auth) { }

  async register(userData: UserAuthData): Promise<AuthReturnType> {
    //return new Promise(res => res(null));
    try {
      return await this.auth.registerWithEmail(userData);
    } catch (authError: any) {
      throw authError;
    }
  }

  async login(email: string, password: string): Promise<AuthReturnType> {
    //return new Promise(res => res(null));
    try {
      return await this.auth.loginWithEmail(email, password);
    } catch (authError: any) {
      throw authError;
    }
  }

  async logout(): Promise<void> {
    //return new Promise(res => res());
    try {
      return await this.auth.logout();
    } catch (authError: any) {
      throw authError;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuth implements AuthMethod {
  //constructor(@Inject(FIREBASE_AUTH_TOKEN) private auth: Auth) {}
  constructor(@Inject(environment.authToken) private auth: Auth) { }

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

  async logout(): Promise<void> {
    try {
      return await this.auth.logout();
    } catch (authError: any) {
      throw authError;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class AppleAuth implements AuthMethod {
  //constructor(@Inject(FIREBASE_AUTH_TOKEN) private auth: Auth) {}
  constructor(@Inject(environment.authToken) private auth: Auth) { }

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

  async logout(): Promise<void> {
    try {
      return await this.auth.logout();
    } catch (authError: any) {
      throw authError;
    }
  }
}