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
  private postRepository = inject(PostRepository);
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

  //private loading = computed<boolean>(() => this.cartItemsPosts.isLoading());
  //private loading = linkedSignal<boolean>(() => this.cartItemsPosts.isLoading());
  private loading = signal<boolean>(false);
  private errorMessage = signal<string>('');

  checkoutState = computed<CheckoutState>(() => ({
    cartItems: this.cartItems(),
    currentUser: this.authService.currentUser()!,
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));


  constructor() {}

  async checkout(saleFormData: { items: CartItemModel[], paymentData: any }): Promise<Sale[] | null> {

    this.loading.set(true);

    // TODO: Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {

      const currentUser: User | null = this.authService.currentUser();
      const saleDate = new Date();
      const completedSales: Sale[] = [];

      for (let item of this.cartItems()) {
        let sale: Sale | null;
        //const postData = this.cartItemsPosts()?.find(post => post._id === item.postId);
        const postData = this.cartItemsPosts.value()?.find(post => post._id === item.postId);
        if (!postData) return null;
        
        // Just in case someone bought the product before
        if (!postData.isActive) throw new Error('Post is inactive'); 

        const saleData = {
          postData: {
            postId: item.postId,
            title: item.title,
            articleCondition: postData.article.condition,
            price: item.price,
            mainImageURL: postData.mainImageURL
          },
          buyerData: {
            userId: currentUser?._id ?? '',
            username: currentUser?.username ?? '',
            profilePictureURL: currentUser?.profilePictureURL ?? '',
          },
          sellerData: {
            userId: postData.user.userId,
            username: postData.user.username,
            profilePictureURL: postData.user.profilePictureURL,
          },
          paymentData: {
            cardName: saleFormData.paymentData.cardName,
            cardNumber: saleFormData.paymentData.cardNumber,
            expirationMonth: saleFormData.paymentData.expirationMonth,
            expirationYear: saleFormData.paymentData.expirationYear,
            cvc: saleFormData.paymentData.cvc,
          },
          saleDate: saleDate
        }

        if (sale = await this.saleRepository.saveSale(saleData)) {

          // Mark post as inactive (handled in firebase trigger)
          /* this.postRepository.updatePost({
            _id: postData._id,
            isActive: false,
            finishedAt: saleDate
          }) */

          // Empty user's cart (handled in firebase trigger)
          // this.cartService.clearCart();
          completedSales.push(sale);
        }
      }

      this.loading.set(false);
      return completedSales;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
