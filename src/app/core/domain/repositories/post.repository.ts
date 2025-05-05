import { inject, Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class PostRepository {
  private storage = inject<Storage<Post>>(environment.storageTokens.post);
  private postConverter: PostConverter;

  async getPostById(id: string): Promise<Post | null> {
    try {
      return await this.storage.getById(id, { collection: 'posts' });
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  getPostById$(id: string): Observable<Post | null> {
    return this.storage.getById$(id, { collection: 'posts' });
  }

  async savePost(post: Post): Promise<Post | null> {
    try {
      await this.storage.create(post);
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async postExists(id: string): Promise<boolean> {
    return await this.storage.exists(id);
  }
} 