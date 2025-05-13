import { computed, effect, inject, Injectable, OutputEmitterRef, signal } from '@angular/core';
import { CartService } from '../../cart/data-access/cart.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { catchError, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { User } from 'src/app/core/domain/models/user.model';
import { Sale } from 'src/app/core/domain/models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  authService = inject(AuthService);
  cartService = inject(CartService);

  postRepository = inject(PostRepository);
  saleRepository = inject(SaleRepository);

  userFullName = computed<string>(() => this.authService.currentUser()?.fullName ?? '');

  cartItems = computed<CartItemModel[]>(() => this.cartService.cart()?.items ?? []);
  cartItemsPosts = signal<Post[] | null>([]);

  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());

  constructor() {
    effect(() => {
      const items = this.cartItems();

      if (items.length === 0 || !this.postRepository.getPostById$) {
        this.cartItemsPosts.set([]);
        return;
      }

      const postObservables = items.map(item =>
        this.postRepository.getPostById$!(item.postId)?.pipe(
          catchError(() => of(null))
        )
      );

      combineLatest([...postObservables]).subscribe(posts => {
        this.cartItemsPosts.set(posts.filter(post => post !== null) as unknown as Post[]);
      });
    });
  }

  async checkout(saleFormData: { items: CartItemModel[], paymentData: any }): Promise<void> {

    // TODO: Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const currentUser: User | null = this.authService.currentUser();
      const saleDate = new Date();

      for (let item of this.cartItems()) {
        let sale: Sale | null;
        const postData = this.cartItemsPosts()?.find(post => post._id === item.postId);
        if (!postData) return;
        
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

          // Mark post as inactive
          this.postRepository.updatePost({
            _id: postData._id,
            isActive: false,
            finishedAt: saleDate
          })

          // Empty user's cart (not necessary since the carts are handled with firebase functions)
          // this.cartService.clearCart();
        }
      }
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
