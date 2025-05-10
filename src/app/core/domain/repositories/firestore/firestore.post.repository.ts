import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { PostRepository } from '../post.repository';
import { Storage } from '../../../storage/storage.interface';
import { FirebaseFirestoreAdapter } from '../../../storage/adapters/firebase-firestore.adapter';
import { PostModel, Post } from '../../models/post.model';
import { FirestorePostConverter } from '../../../storage/adapters/converters/firestore.post.converter';

@Injectable({ providedIn: 'root' })
export class FirestorePostRepository implements PostRepository {
  private storage = inject<Storage<Post>>(FirebaseFirestoreAdapter<PostModel>);
  private postConverter: FirestorePostConverter;

  constructor() {
    this.postConverter = new FirestorePostConverter();
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      return await this.storage.getById(id, { collection: 'posts' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getPostById$(id: string): Observable<Post | null> | null {
    if (!this.storage.getById$) return null;
    try {
      return this.storage.getById$(id, { collection: 'posts' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getPostsByUserId(userId: string): Promise<Post[] | null> {
    try {
      const posts: Post[] | null = await this.storage.getByField('userId', userId, { collection: 'posts', converter: this.postConverter });
      return posts;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getPostsByUserId$(userId: string): Observable<Post[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('userId', userId, { collection: 'posts', converter: this.postConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getPostsByUsername(username: string): Promise<Post[] | null> {
    try {
      const posts: Post[] | null = await this.storage.getByField('username', username, { collection: 'posts', converter: this.postConverter });
      return posts;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getPostsByUsername$(username: string): Observable<Post[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('username', username, { collection: 'posts', converter: this.postConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getAllPosts(): Promise<Post[] | null> {
    if (!this.storage.getCollection) return null;
    
    try {
      return this.storage.getCollection({ collection: 'posts', converter: this.postConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getAllPosts$(): Observable<Post[] | null> | null {
    if (!this.storage.getCollection$) return null;

    try {
      return this.storage.getCollection$({ collection: 'posts', converter: this.postConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async queryPosts(queryConstraints?: any): Promise<Post[] | null> {
    try {
      return this.storage.query({ 
        collection: 'posts',
        converter: this.postConverter,
        queryConstraints
      });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  queryPosts$(queryConstraints?: any): Observable<Post[] | null> | null {
    if (!this.storage.query$) return null;

    try {
      return this.storage.query$({ 
        collection: 'posts',
        converter: this.postConverter,
        queryConstraints
      });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async savePost(postData: Partial<PostModel>): Promise<Post | null> {
    try {
      const _post: Post = Post.Build(postData);
      let post: Post | null;
      if (post = await this.storage.create(_post, { collection: 'posts', converter: this.postConverter })) {
        return post; // Return the created post with timestamps
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async updatePost(postData: Partial<Post> & { _id: string }): Promise<Post | null> {
    try {
      let post: Post | null;
      if (post = await this.storage.update(postData, { collection: 'posts', converter: this.postConverter })) {
        return post;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      return await this.storage.remove(id);
    } catch (storageError) {
      throw storageError;
    }
  }

  async postExists(id: string): Promise<boolean> {
    try {
      return await this.storage.exists(id);
    } catch (storageError) {
      throw storageError;
    }
  }
}