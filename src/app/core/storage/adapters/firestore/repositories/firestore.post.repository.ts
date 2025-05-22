import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { PostRepository } from '../../../../domain/repositories/post.repository';
import { FirestoreAdapter } from '../firestore.adapter';
import { PostModel, Post } from '../../../../domain/models/post.model';
import { FirestorePostConverter } from '../converters/firestore.post.converter';

@Injectable({ providedIn: 'root' })
export class FirestorePostRepository implements PostRepository {
  private firestore: FirestoreAdapter<Post> = inject(FirestoreAdapter<PostModel>);
  private postConverter: FirestorePostConverter = new FirestorePostConverter();

  async getPostById(id: string): Promise<Post | null> {
    try {
      return await this.firestore.getById(id, { collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getPostById$(id: string): Observable<Post | null> | null {
    try {
      return this.firestore.getById$(id, { collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getPostsByUserId(userId: string): Promise<Post[] | null> {
    try {
      const posts: Post[] | null = await this.firestore.getByField('userId', userId, { collection: 'posts', converter: this.postConverter });
      return posts;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getPostsByUserId$(userId: string): Observable<Post[] | null> | null {
    try {
      return this.firestore.getByField$('userId', userId, { collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getPostsByUsername(username: string): Promise<Post[] | null> {
    try {
      const posts: Post[] | null = await this.firestore.getByField('username', username, { collection: 'posts', converter: this.postConverter });
      return posts;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getPostsByUsername$(username: string): Observable<Post[] | null> | null {
    try {
      return this.firestore.getByField$('username', username, { collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getAllPosts(): Promise<Post[] | null> {
    try {
      return this.firestore.getCollection({ collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getAllPosts$(): Observable<Post[] | null> | null {
    try {
      return this.firestore.getCollection$({ collection: 'posts', converter: this.postConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async queryPosts(queryConstraints?: any): Promise<Post[] | null> {
    try {
      return this.firestore.query({ 
        collection: 'posts',
        converter: this.postConverter,
        queryConstraints
      });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  queryPosts$(queryConstraints?: any): Observable<Post[] | null> | null {
    try {
      return this.firestore.query$({ 
        collection: 'posts',
        converter: this.postConverter,
        queryConstraints
      });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async savePost(postData: Partial<PostModel>): Promise<Post | null> {
    try {
      const _post: Post = Post.Build(postData);
      let post: Post | null;
      if (post = await this.firestore.create(_post, { collection: 'posts', converter: this.postConverter })) {
        return post;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async updatePost(postData: Partial<Post> & { _id: string }): Promise<Post | null> {
    try {
      let post: Post | null;
      if (post = await this.firestore.update(postData, { collection: 'posts', converter: this.postConverter })) {
        return post;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      return await this.firestore.remove(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async postExists(id: string): Promise<boolean> {
    try {
      return await this.firestore.exists(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }
}