import { User, UserModel } from "../../../domain/models/user.model";

export type AuthProvider = 'google' | 'apple';

export type UserData = { email: string, password: string } & Partial<Omit<UserModel, 'email' | 'password'>>;

export interface Auth {
  registerWithEmail(userData: UserData): Promise<User | null>;
  registerWithProvider(provider: AuthProvider): Promise<User | null>;
  loginWithEmail(email: string, password: string): Promise<User | null>;
  loginWithProvider(provider: AuthProvider): Promise<User | null>;
  logout(): Promise<void>;
}