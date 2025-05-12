import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart, CartItemModel } from 'src/app/core/domain/models/cart.model';
import { Post } from 'src/app/core/domain/models/post.model';
import { CartRepository } from 'src/app/core/domain/repositories/cart.repository';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { AuthStatus } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { CartService } from '../../cart/data-access/cart.service';

@Injectable({
  providedIn: 'root'
})
export class PostDetailService {
  private postRepository = inject(PostRepository);
  private cartService = inject(CartService); 
  
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

  async getPostData$(postId: string | null): Promise<Observable<Post | null> | null> {
    if (!this.postRepository.getPostById$) return null;
    try {
      if (!postId) return null;
      return this.postRepository.getPostById$(postId);
    } catch (storageError) {
      console.error(storageError);
      this.errorMessage.set(storageError as string);
      throw storageError;
    }
  }

  async addToCart(item: CartItemModel): Promise<void> {
    try {
      await this.cartService.addItemToCart({
        postId: item.postId,
        title: item.title,
        price: item.price,
        shipping: item.shipping,
        mainImageURL: item.mainImageURL
      });
    } catch (storageError) {
      console.error(storageError);
      this.errorMessage.set(storageError as string);
      throw storageError;
    }
  }
}
