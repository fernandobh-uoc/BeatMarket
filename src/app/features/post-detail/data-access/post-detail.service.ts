import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cart, CartItemModel } from 'src/app/core/domain/models/cart.model';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { CartRepository } from 'src/app/core/domain/repositories/cart.repository';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { CartService } from '../../cart/data-access/cart.service';
import { ConversationRepository } from 'src/app/core/domain/repositories/conversation.repository';
import { Conversation } from 'src/app/core/domain/models/conversation.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConversationService } from '../../conversations/conversation/data-access/conversation.service';

type PostDetailState = {
  postData: PostModel | null;
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostDetailService {
  private postRepository = inject(PostRepository);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private conversationService = inject(ConversationService);
  private router = inject(Router);

  private errorMessage = signal<string>('');
  
  private postId = signal<string | undefined>(undefined);
  private postResource = rxResource<PostModel | null, string | undefined>({
    request: () => this.postId(),
    loader: ({ request: postId }): Observable<PostModel | null> => {
      if (!postId) return of(null);

      try {
        const post$ = this.postRepository.getPostById$(postId);
        return post$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  })

  postDetailState = computed<PostDetailState>(() => ({
    postData: this.postResource.value() ?? null,
    loading: this.postResource.isLoading(),
    errorMessage: this.errorMessage()
  }));

  setPostId(postId: string): void {
    this.postId.set(postId);
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

  async loadConversation(): Promise<void> {
    try {
      const currentPostId: string | undefined = this.postId();
      if (!currentPostId) return;
      let conversationId: string | null = await this.conversationService.getConversationId({ postId: currentPostId });

      if (!conversationId) {
        conversationId = await this.conversationService.createConversation({ 
          relatedPostData: {
            postId: currentPostId,
            title: this.postResource.value()?.title ?? '',
            price: this.postResource.value()?.price ?? 0,
            isActive: this.postResource.value()?.isActive ?? false,
            mainImageURL: this.postResource.value()?.mainImageURL ?? ''
          },
          buyerData: {
            userId: this.authService.currentUser()?._id ?? '',
            username: this.authService.currentUser()?.username ?? '',
            profilePictureURL: this.authService.currentUser()?.profilePictureURL ?? ''
          },
          sellerData: {
            userId: this.postResource.value()?.user?.userId ?? '',
            username: this.postResource.value()?.user?.username ?? '',
            profilePictureURL: this.postResource.value()?.user?.profilePictureURL ?? ''
          }
        });
      }

      if (!conversationId) return;

      this.router.navigate([`/conversation/${conversationId}`]);
      
    } catch (error) {
      this.errorMessage.set((error as any)?.message ?? 'Unknown error');
    }
  }
}
