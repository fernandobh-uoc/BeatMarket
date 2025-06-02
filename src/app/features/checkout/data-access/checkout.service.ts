import { computed, effect, inject, Injectable, linkedSignal, OutputEmitterRef, signal } from '@angular/core';
import { CartService } from '../../cart/data-access/cart.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { catchError, combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { User } from 'src/app/core/domain/models/user.model';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { StripeService } from '../../stripe-setup/data-access/stripe.service';
import { StripeCardElement } from '@stripe/stripe-js';
import { Stripe } from '@stripe/stripe-js';

type CheckoutState = {
  cartItems: CartItemModel[],
  currentUser: User,
  loading: boolean,
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private stripeService = inject(StripeService);
  private postRepository = inject(PostRepository);
  private userRepository = inject(UserRepository);
  private saleRepository = inject(SaleRepository);

  private cartItems = computed<CartItemModel[]>(() => this.cartService.cartState()?.cartItems ?? []);

  private cartItemsPosts = rxResource<Post[] | null, string[] | null>({
    request: () => this.cartItems().map(item => item.postId),
    loader: ({ request: postIds }): Observable<Post[]> => {
      if (!postIds || !postIds.length) return of([]);

      try {
        const postObservables: Observable<Post | null>[] = postIds.map(postId => {
          return this.postRepository.getPostById$(postId) ?? of(null);
        });
  
        return combineLatest(postObservables).pipe(
          map(posts => posts.filter((post): post is Post => post !== null))
        )
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of([]);
      }
    }
  })

  private loading = signal<boolean>(false);
  private errorMessage = linkedSignal<string>(() => this.stripeService.stripeState().errorMessage);

  checkoutState = computed<CheckoutState>(() => ({
    cartItems: this.cartItems(),
    currentUser: this.authService.currentUser()!,
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));


  constructor() {}

  async checkout({ stripeInstance, stripeCardElement, cardName }: { stripeInstance: Stripe, stripeCardElement: StripeCardElement, cardName: string }): Promise<Sale[] | null> { 
    this.loading.set(true);

    const completedSales: Sale[] = [];
    try {
      const groupedItemsBySeller = await this.getGroupedItemsBySeller({
        cartItems: this.cartItems(),
        cartItemsPosts: this.cartItemsPosts.value() ?? []
      });
      
      for (const [sellerStripeId, items] of groupedItemsBySeller.entries()) {
        const totalAmount = items.reduce((acc, item) => acc + item.price + item.shipping, 0) * 100;

        const paymentIntent = await this.stripeService.createPaymentIntent({ totalAmount, currency: 'eur', sellerStripeId });
        const clientSecret = paymentIntent?.clientSecret;

        if (!clientSecret) continue; 

        const paymentIntentResult = await this.stripeService.confirmPayment({
          stripeInstance,
          clientSecret,
          stripeCard: stripeCardElement,
          cardName,
        });

        if (!paymentIntentResult 
          || paymentIntentResult?.error 
          || paymentIntentResult.paymentIntent.status !== 'succeeded'
        ) {
          continue;
        }

        for (const item of items) {
          const itemPost = this.cartItemsPosts.value()?.find(post => post._id === item.postId);
          if (!itemPost) continue;
          const completedSale = await this.saveSale({
            item: item,
            itemPost: itemPost,
            paymentIntentId: paymentIntentResult.paymentIntent.id,
            currentUser: this.authService.currentUser()!
          })

          if (completedSale) {
            completedSales.push(completedSale);
          }
        }
      }

      return completedSales;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  private async getGroupedItemsBySeller({ cartItems, cartItemsPosts }: { cartItems: CartItemModel[], cartItemsPosts: PostModel[] }): Promise<Map<string, CartItemModel[]>> {
    const groupedItemsBySeller = new Map<string, CartItemModel[]>();

    try {
      for (const item of cartItems) {
        const post = cartItemsPosts?.find(p => p._id === item.postId);
        if (!post) continue;
  
        const sellerUser = await this.userRepository.getUserById(post.user.userId);
        const sellerStripeId = sellerUser?.stripeAccountId;
        if (!sellerStripeId) continue;
  
        if (!groupedItemsBySeller.has(sellerStripeId)) {
          groupedItemsBySeller.set(sellerStripeId, []);
        }
  
        groupedItemsBySeller.get(sellerStripeId)?.push(item);
      }
      return groupedItemsBySeller;
    } catch (error) {
      throw error;
    }
  }

  private async saveSale({ item, itemPost, paymentIntentId, currentUser }: { item: CartItemModel, itemPost: PostModel, paymentIntentId: string, currentUser: User }): Promise<Sale | null> {
    let sale: Sale | null;
    
    // Just in case someone bought the product before
    if (!itemPost.isActive) throw new Error('Post is inactive'); 

    const saleData = {
      postData: {
        postId: item.postId,
        title: item.title,
        articleCondition: itemPost.article.condition,
        price: item.price,
        mainImageURL: itemPost.mainImageURL
      },
      buyerData: {
        userId: currentUser?._id ?? '',
        username: currentUser?.username ?? '',
        profilePictureURL: currentUser?.profilePictureURL ?? '',
      },
      sellerData: {
        userId: itemPost.user.userId,
        username: itemPost.user.username,
        profilePictureURL: itemPost.user.profilePictureURL,
      },
      stripePaymentId: paymentIntentId,
      saleDate: new Date()
    }

    if (sale = await this.saleRepository.saveSale(saleData)) {
      return sale;
    }
    return null;
  }
}
