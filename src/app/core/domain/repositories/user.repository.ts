import { inject, Injectable } from '@angular/core';
import { ActivePost, User, UserModel } from '../models/user.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { ActivePostConverter, UserConverter } from '../../services/storage/adapters/converters/user.converter';
import { Post, PostModel } from '../models/post.model';
import { combineLatestWith, map, of, switchMap } from 'rxjs';
import { collection } from 'firebase/firestore';
import { ArticleModel } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private storage = inject<Storage<User>>(environment.storageTokens.user);
  private userConverter: UserConverter;
  private activePostConverter: ActivePostConverter;

  constructor() {
    this.userConverter = new UserConverter();
    this.activePostConverter = new ActivePostConverter();
  }

  async getUserById(id: string, includeActivePosts: boolean = true): Promise<User | null> {
    try {
      const user = await this.storage.getById(id, { collection: 'users', converter: this.userConverter });
      if (!user) return null;

      if (!includeActivePosts || !this.storage.getCollection) {
        return user;
      }

      const activePosts: ActivePost[] = 
        await this.storage.getCollection({ 
          collection: `users/${id}/activePosts`, 
          converter: this.activePostConverter 
        });
      user.activePosts = activePosts ?? [];
      return user;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getUserById$(id: string, includeActivePosts: boolean = true): Observable<User | null> | null {
    if (!this.storage.getById$) return null;
    
    try {
      const user$: Observable<User | null> = this.storage.getById$(id, { collection: 'users', converter: this.userConverter });
      if (!includeActivePosts || !this.storage.getCollection$) return user$;

      const activePosts$: Observable<ActivePost[] | null> =
        this.storage.getCollection$({
          collection: `users/${id}/activePosts`,
          converter: this.activePostConverter
        });

      return user$.pipe(
        combineLatestWith(activePosts$),
        map(([user, activePosts]) => {
          if (user) {
            user.activePosts = activePosts ?? [];
            return user;
          }
          return null;
        })
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getUserByEmail(email: string, includeActivePosts: boolean = true): Promise<User | null> {
    try {
      let user: User | null = null;
      const users: User[] | null = await this.storage.getByField('email', email, { collection: 'users', converter: this.userConverter });
      if (users && users.length > 0) {
        user = users[0];
      }
      if (!includeActivePosts || !this.storage.getCollection) {
        return user;
      }

      const activePosts = await this.storage.getCollection({ collection: `users/${user?._id}/activePosts`, converter: this.activePostConverter });
      if (user) {
        user.activePosts = activePosts ?? [];
      }
      return user;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getUserByEmail$(email: string, includeActivePosts: boolean = true): Observable<User | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      const user$: Observable<User | null> =
        this.storage.getByField$('email', email, { collection: 'users', converter: this.userConverter }).pipe(
          map(users => users && users.length > 0 ? users[0] : null)
        );

      if (!includeActivePosts || !this.storage.getCollection$) {
        return user$;
      }

      return user$.pipe(
        switchMap(user => {
          if (!user || !this.storage.getCollection$) return of(null);

          return this.storage.getCollection$({
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
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users: User[] | null = await this.storage.getByField('username', username, { collection: 'users', converter: this.userConverter });
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getUserByUsername$(username: string): Observable<User | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('username', username, { collection: 'users' }).pipe(
        map(users => users && users.length > 0 ? users[0] : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getAllUsers(): Promise<User[] | null> {
    if (!this.storage.getCollection) return null;
    
    try {
      return await this.storage.getCollection({ collection: 'users', converter: this.userConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getAllUsers$(): Observable<User[] | null> | null {
    if (!this.storage.getCollection$) return null;

    try {
      return this.storage.getCollection$({ collection: 'users', converter: this.userConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async saveUser(userData: Partial<UserModel>): Promise<User | null> {
    try {
      const _user: User = User.Build(userData);
      let user: User | null;
      if (user = await this.storage.create(_user, { collection: 'users', converter: this.userConverter })) {
        console.log({ user });
        return user; // Return the created user with timestamps
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async updateUser(userData: Partial<UserModel> & { _id: string }): Promise<User | null> {
    try {
      let user: User | null;
      if (user = await this.storage.update(userData, { collection: 'users', converter: this.userConverter })) {
        return user;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async saveActivePost(userId: string, postId: string, activePostData: ActivePost): Promise<User | null> {
    if (!this.storage.createInSubcollection) return null;

    try {
      let user: User | null;
      if (user = await this.storage.createInSubcollection(
        activePostData, { 
          collection: `users/${userId}/activePosts/${postId}`, 
          converter: this.activePostConverter 
        })
      ) {
        console.log({ user });
        return user;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async userExists(id: string): Promise<boolean> {
    return await this.storage.exists(id);
  }
}