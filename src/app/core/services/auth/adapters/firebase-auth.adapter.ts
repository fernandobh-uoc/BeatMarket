import { inject, Injectable, InjectionToken, Provider, signal } from '@angular/core';
import { 
  Auth as FirebaseAuth, 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  AuthErrorCodes,
  onAuthStateChanged,
  signOut,
  updateProfile, 
  updatePassword,
  sendPasswordResetEmail,
  ActionCodeSettings,
  UserCredential
} from '@angular/fire/auth';
import { Auth, AuthProvider, AuthReturnType, UserAuthData } from '../auth.interface';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthAdapter implements Auth {
  private firebaseAuth = inject(FirebaseAuth);
  
  private _firebaseUser = signal<FirebaseUser | null>(null);

  get firebaseUser() {
    return this._firebaseUser.asReadonly();
  }
  
  constructor() {
    onAuthStateChanged(this.firebaseAuth, async (firebaseUser: FirebaseUser | null): Promise<void> => {
      this._firebaseUser.set(firebaseUser);
    });
  }

  async registerWithEmail(userData: UserAuthData): Promise<AuthReturnType> {
    try {
      const firebaseUser: FirebaseUser = await createUserWithEmailAndPassword(
        this.firebaseAuth, 
        userData.email, 
        userData.password
      ).then(userCred => userCred.user);

      await updateProfile(firebaseUser, {
        displayName: userData.username
      });

      return { uid: firebaseUser.uid };
    } catch (authError: any) {
      throw this.getErrorMessage(authError.code || authError.message);
    }
  }

  async registerWithProvider(provider: AuthProvider): Promise<AuthReturnType> {
    // In Firebase, this is the same as logging in for the first time
    return await this.loginWithProvider(provider);
  }

  async loginWithEmail(email: string, password: string): Promise<AuthReturnType> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
      const firebaseUser: FirebaseUser = userCredential.user;
      return { uid: firebaseUser.uid };

    } catch (authError: any) {
      throw this.getErrorMessage(authError.code || authError.message);
    }
  }

  async loginWithProvider(provider: AuthProvider): Promise<AuthReturnType> {
    try {
      const authProvider = provider === 'google' ?
        new GoogleAuthProvider() :
        new OAuthProvider('apple.com');

      const userCredential: UserCredential = await signInWithPopup(this.firebaseAuth, authProvider);
      const firebaseUser: FirebaseUser = userCredential.user;

      return { uid: firebaseUser.uid };
    } catch (authError: any) {
      throw this.getErrorMessage(authError.code || authError.message);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseAuth);
    } catch (authError: any) {
      throw authError;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      console.log("resetting password");
      await sendPasswordResetEmail(this.firebaseAuth, email);
    } catch (authError: any) {
      throw authError;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const firebaseUser: FirebaseUser | null = this._firebaseUser();
      if (!firebaseUser) return;
      
      await updatePassword(firebaseUser, newPassword);
    } catch (authError: any) {
      throw authError;
    }
  }

  private getErrorMessage(errorCode: string): string {
    console.error(errorCode);
    /* const errorMessages: Record<string, string> = {
      [AuthErrorCodes.USER_DELETED]: 'Usuario no encontrado. Por favor, regístrate primero.',
      [AuthErrorCodes.INVALID_PASSWORD]: 'Contraseña incorrecta. Inténtalo de nuevo.',
      [AuthErrorCodes.INVALID_EMAIL]: 'Formato de correo electrónico inválido.',
      [AuthErrorCodes.USER_DISABLED]: 'Esta cuenta ha sido deshabilitada.',
      [AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER]: 'Demasiados intentos fallidos. Inténtalo más tarde.'
    };

    return errorMessages[errorCode] || 'Autenticacion fallida. Por favor, inténtalo de nuevo.'; */
    return 'Las credenciales son incorrectas.';	
  }
}
