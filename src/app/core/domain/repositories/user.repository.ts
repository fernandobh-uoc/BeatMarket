import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { ActivePostConverter, UserConverter } from '../../services/storage/adapters/converters/user.converter'; 
import { Post } from '../models/post.model';
import { combineLatestWith, map, of } from 'rxjs';

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
      if (!includeActivePosts || !this.storage.getCollection) {
        return user;
      }

      const activePosts = await this.storage.getCollection({ collection: `users/${id}/activePosts`, converter: this.activePostConverter });
      if (user) {
        user.activePosts = activePosts ?? []; 
      }
      return user;

      //return await this.storage.getById(id, { collection: 'users', converter: this.converter });
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  getUserById$(id: string, includeActivePosts: boolean = true): Observable<User | null> | null {
    if (this.storage.getById$) {
      const user$: Observable<User | null> = this.storage.getById$(id, { collection: 'users', converter: this.userConverter });
      if (!includeActivePosts) return user$;

      if (this.storage.getCollection$) {
        const activePosts$: Observable<Partial<Post>[] | null> = this.storage.getCollection$({ collection: `users/${id}/activePosts`, converter: this.activePostConverter });
        return user$.pipe(
          combineLatestWith(activePosts$),
          map(([user, activePosts]) => {
            if (user) {
              user.activePosts = activePosts ?? [];
              return user;
            }
            return null;
          })
        )
      }
    }
    return null;
  }

  async getUserByEmail(email: string, includeActivePosts: boolean = true): Promise<User | null> {
    try {
      const users: User[] | null = await this.storage.getByField('email', email, { collection: 'users', converter: this.userConverter });
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }
  
  getUserByEmail$(email: string): Observable<User | null> {
    try {
      if (this.storage.getByField$) {
        return this.storage.getByField$('email', email, { collection: 'users' }).pipe(
          map(users => users && users.length > 0 ? users[0] : null)
        );
      }
    } catch (storageError) {
      console.error(storageError);
    }
    return of(null);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users: User[] | null = await this.storage.getByField('username', username, { collection: 'users' });
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  getUserByUsername$(username: string): Observable<User | null> {
    try {
      if (this.storage.getByField$) {
        return this.storage.getByField$('username', username, { collection: 'users' }).pipe(
          map(users => users && users.length > 0 ? users[0] : null)
        );
      }
    } catch (storageError) {
      console.error(storageError);
    }
    return of(null);
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (this.storage.getCollection) {
        return await this.storage.getCollection({ collection: 'users', converter: this.userConverter });
      }
    } catch (storageError) {
      console.error(storageError);
    }
    return [];
  }

  getAllUsers$(): Observable<User[]> {
    try {
      if (this.storage.getCollection$) {
        return this.storage.getCollection$({ collection: 'users', converter: this.userConverter });
      }
    } catch (storageError) {
      console.error(storageError);
    }
    return of([]);
  }

  async saveUser(userData: Partial<User>): Promise<User | null> {
    try {
      const user: User = User.Build(userData);
      console.dir(`Saving user: ${{...user}}`);
      await this.storage.create(user, { collection: 'users', converter: this.userConverter });
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async userExists(uid: string): Promise<boolean> {
    return await this.storage.exists(uid);
  }

  /* async getUpdatedUser(): Promise<User | null> {
    return new Promise((resolve) => {
      if (this.#user$()) {
        resolve(this.#user$());
        return;
      }
      // Create a reactive effect that waits for user to be updated
      const watcher: EffectRef = effect((onCleanup) => {
        const user = this.#user$();
        if (user) {
          watcher.destroy();
          resolve(user);
        }

        onCleanup(() => watcher.destroy());
      });
    });
  } */
}