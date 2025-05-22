import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PostModel, Post } from '../models/post.model';

export const PostRepository = new InjectionToken<PostRepository>('PostRepository');

export interface PostRepository {
  getPostById(id: string): Promise<Post | null>;
  getPostById$(id: string): Observable<Post | null> | null;
  getPostsByUserId(userId: string): Promise<Post[] | null>;
  getPostsByUserId$(userId: string): Observable<Post[] | null> | null;
  getPostsByUsername(username: string): Promise<Post[] | null>;
  getPostsByUsername$(username: string): Observable<Post[] | null> | null;
  getAllPosts(): Promise<Post[] | null>;
  getAllPosts$(): Observable<Post[] | null> | null;
  queryPosts(queryConstraints?: any): Promise<Post[] | null>;
  queryPosts$(queryConstraints?: any): Observable<Post[] | null> | null;
  savePost(postData: Partial<PostModel>): Promise<Post | null>;
  updatePost(postData: Partial<Post> & { _id: string }): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
  postExists(id: string): Promise<boolean>;
}