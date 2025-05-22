import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { UserModel, User, ActivePost } from '../models/user.model';

export const UserRepository = new InjectionToken<UserRepository>('UserRepository');

export interface UserRepository {
  getUserById(id: string, includeActivePosts?: boolean): Promise<User | null>;
  getUserById$?(id: string, includeActivePosts?: boolean): Observable<User | null> | null;
  getUserByEmail(email: string, includeActivePosts?: boolean): Promise<User | null>;
  getUserByEmail$?(email: string, includeActivePosts?: boolean): Observable<User | null> | null;
  
  getUserByUsername(username: string): Promise<User | null>;
  getUserByUsername$?(username: string): Observable<User | null> | null;
  getAllUsers(): Promise<User[] | null>;
  getAllUsers$?(): Observable<User[] | null> | null;
  saveUser(userData: Partial<UserModel>): Promise<User | null>;
  updateUser(userData: Partial<UserModel> & { _id: string }): Promise<User | null>;
  saveActivePost({ userId, activePostData }: { userId: string, activePostData: Omit<ActivePost, '_id'> }): Promise<ActivePost | null>;
  userExists(id: string): Promise<boolean>;
}