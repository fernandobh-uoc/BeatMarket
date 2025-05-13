import { inject, Injectable, signal } from '@angular/core';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  postRepository = inject(PostRepository);

  errorMessage = signal<string>('');

  constructor() { }

  async search(constraints: any): Promise<Post[] | null> {
    try {
      return await this.postRepository.queryPosts(constraints);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }
}
