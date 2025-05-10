import { InjectionToken } from "@angular/core";
import { UserModel } from "../../domain/models/user.model";

export type AuthProvider = 'google' | 'apple';

export type UserAuthData = { email: string, password: string, profilePictureDataURL?: string } & Partial<Omit<UserModel, 'email' | 'password'>>;
export type AuthReturnType = UserModel | { uid: string } | boolean | null | void;

export const Auth = new InjectionToken<Auth>('Auth');

export interface Auth {
  registerWithEmail(userData: UserAuthData): Promise<AuthReturnType>;
  registerWithProvider(provider: AuthProvider): Promise<AuthReturnType>;
  loginWithEmail(email: string, password: string): Promise<AuthReturnType>;
  loginWithProvider(provider: AuthProvider): Promise<AuthReturnType>;
  logout(): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}