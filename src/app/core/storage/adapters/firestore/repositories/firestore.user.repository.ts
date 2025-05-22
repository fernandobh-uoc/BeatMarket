import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { UserRepository } from '../../../../domain/repositories/user.repository';
import { FirestoreAdapter } from '../firestore.adapter'; 
import { UserModel, User, ActivePost } from '../../../../domain/models/user.model';
import { FirestoreActivePostConverter, FirestoreUserConverter } from '../converters/firestore.user.converter';

@Injectable({ providedIn: 'root' })
export class FirestoreUserRepository implements UserRepository {
  private firestore: FirestoreAdapter<User> = inject(FirestoreAdapter<UserModel>);
  private userConverter: FirestoreUserConverter = new FirestoreUserConverter();
  private activePostConverter: FirestoreActivePostConverter = new FirestoreActivePostConverter();

  async getUserById(id: string, includeActivePosts: boolean = true): Promise<User | null> {
    try {
      const user = await this.firestore.getById(id, { collection: 'users', converter: this.userConverter });
      if (!user) return null;

      if (!includeActivePosts || !this.firestore.getCollection) {
        return user;
      }

      const activePosts: ActivePost[] = 
        await this.firestore.getCollection({ 
          collection: `users/${id}/activePosts`, 
          converter: this.activePostConverter 
        });
      user.activePosts = activePosts ?? [];
      return user;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getUserById$(id: string, includeActivePosts: boolean = true): Observable<User | null> | null {
    try {
      const user$: Observable<User | null> = this.firestore.getById$(id, { collection: 'users', converter: this.userConverter });
      if (!includeActivePosts || !this.firestore.getCollection$) return user$;

      const activePosts$: Observable<ActivePost[] | null> =
        this.firestore.getCollection$({
          collection: `users/${id}/activePosts`,
          converter: this.activePostConverter
        });

      return combineLatest([user$, activePosts$]).pipe(
        map(([user, activePosts]) => {
          if (user) {
            user.activePosts = activePosts ?? [];
            return user;
          }
          return null;
        })
      );
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getUserByEmail(email: string, includeActivePosts: boolean = true): Promise<User | null> {
    try {
      let user: User | null = null;
      const users: User[] | null = await this.firestore.getByField('email', email, { collection: 'users', converter: this.userConverter });
      if (users && users.length > 0) {
        user = users[0];
      }
      if (!includeActivePosts || !this.firestore.getCollection) {
        return user;
      }

      const activePosts = await this.firestore.getCollection({ collection: `users/${user?._id}/activePosts`, converter: this.activePostConverter });
      if (user) {
        user.activePosts = activePosts ?? [];
      }
      return user;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getUserByEmail$(email: string, includeActivePosts: boolean = true): Observable<User | null> | null {
    try {
      const user$: Observable<User | null> =
        this.firestore.getByField$('email', email, { collection: 'users', converter: this.userConverter }).pipe(
          map(users => users && users.length > 0 ? users[0] : null)
        );

      if (!includeActivePosts || !this.firestore.getCollection$) {
        return user$;
      }

      return user$.pipe(
        switchMap(user => {
          if (!user || !this.firestore.getCollection$) return of(null);

          return this.firestore.getCollection$({
            collection: `users/${user._id}/activePosts`,
            converter: this.activePostConverter
          }).pipe(
            map(activePosts => {
              user.activePosts = activePosts ?? [];
              return user;
            })
          )
        })
      )
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users: User[] | null = await this.firestore.getByField('username', username, { collection: 'users', converter: this.userConverter });
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getUserByUsername$(username: string): Observable<User | null> | null {
    try {
      return this.firestore.getByField$('username', username, { collection: 'users' }).pipe(
        map(users => users && users.length > 0 ? users[0] : null)
      );
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getAllUsers(): Promise<User[] | null> {
    try {
      return await this.firestore.getCollection({ collection: 'users', converter: this.userConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getAllUsers$(): Observable<User[] | null> | null {
    try {
      return this.firestore.getCollection$({ collection: 'users', converter: this.userConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async saveUser(userData: Partial<UserModel>): Promise<User | null> {
    try {
      const _user: User = User.Build(userData);
      let user: User | null;
      if (user = await this.firestore.create(_user, { collection: 'users', converter: this.userConverter })) {
        return user; // Return the created user with timestamps
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async updateUser(userData: Partial<UserModel> & { _id: string }): Promise<User | null> {
    try {
      let user: User | null;
      if (user = await this.firestore.update(userData, { collection: 'users', converter: this.userConverter })) {
        return user;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async saveActivePost({ userId, activePostData }: { userId: string, activePostData: ActivePost }): Promise<ActivePost | null> {
    try {
      let activePost: ActivePost | null;
      if (activePost = await this.firestore.createInSubcollection(
        activePostData, 
        { 
          collection: `users/${userId}/activePosts`, 
          converter: this.activePostConverter 
        })
      ) {
        return activePost;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async userExists(id: string): Promise<boolean> {
    return await this.firestore.exists(id);
  }
}