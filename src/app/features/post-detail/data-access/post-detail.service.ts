import { inject, Injectable, signal } from '@angular/core';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';

@Injectable({
  providedIn: 'root'
})
export class PostDetailService {
  private postRepository = inject(PostRepository);
  
  errorMessage = signal<string>('');

  async getPostData(postId: string | null): Promise<Post | null> {
    try {
      if (!postId) return null;
      return await this.postRepository.getPostById(postId);
    } catch (storageError) {
      console.error(storageError);
      this.errorMessage.set(storageError as string);
      throw storageError;
    }
  }
}
