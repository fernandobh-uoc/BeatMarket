import {
  Injectable,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CartItemModel, CartModel } from 'src/app/core/domain/models/cart.model';
import { CartRepository } from 'src/app/core/domain/repositories/cart.repository';

type CartState = {
  cartItems: CartItemModel[],
  cartItemsAmount: number,
  loading: boolean,
  errorMessage: string
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartRepository = inject(CartRepository);
  private authService = inject(AuthService);

  private errorMessage = signal<string>('');

  private cartResource = rxResource({
    request: () => this.authService.currentUser(),
    loader: ({ request: currentUser }): Observable<CartModel | null> => {
      if (!this.cartRepository.getCartByUserId$) return of(null);
      if (!currentUser?._id) return of(null);

      try {
        const cart$ = this.cartRepository.getCartByUserId$(currentUser._id);
        return cart$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  });

  private cartItemsAmount = computed(() => this.cartResource.value()?.items.length ?? 0);

  cartState = computed<CartState>(() => ({
    cartItems: this.cartResource.value()?.items ?? [],
    cartItemsAmount: this.cartItemsAmount(), 
    loading: this.cartResource.isLoading(), 
    errorMessage: this.errorMessage() 
  }));

  async createCart(userId: string): Promise<void> {
    await this.cartRepository.saveCart({ userId });
  }

  async addItemToCart(item: CartItemModel): Promise<void> {
    const cart = this.cartResource.value();
    console.log({ cart });
    if (!cart) return;

    const exists = cart.items.find(i => i.postId === item.postId);
    if (exists) {
      console.warn(`Item with postId ${item.postId} already in cart`);
      return;
    }

    cart.items.push(item);
    await this.cartRepository.updateCart(cart);
  }

  async removeItemFromCart(postId: string): Promise<void> {
    const cart = this.cartResource.value();
    if (!cart) return;

    const index = cart.items.findIndex(i => i.postId === postId);
    if (index === -1) return;

    cart.items.splice(index, 1);
    await this.cartRepository.updateCart(cart);
  }

  async clearCart(): Promise<void> {
    const cart = this.cartResource.value();
    if (!cart) return;

    cart.items = [];
    await this.cartRepository.updateCart(cart);
  }
}
