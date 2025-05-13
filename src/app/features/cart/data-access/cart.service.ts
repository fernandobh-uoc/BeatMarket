import { signal, computed, inject, Injectable } from '@angular/core';
import { CartItemModel, CartModel } from 'src/app/core/domain/models/cart.model';
import { CartRepository } from 'src/app/core/domain/repositories/cart.repository';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { AuthStatus } from 'src/app/core/services/auth/auth.service';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartRepository = inject(CartRepository);
  cache = inject(LocalStorageService);

  #cart = signal<CartModel | null>(null);
  #cartItemsAmount = computed<number>(() => this.#cart()?.items.length ?? 0);

  get cart() {
    return this.#cart.asReadonly();
  }

  get cartItemsAmount() {
    return this.#cartItemsAmount;
  }

  async createCart(userId: string): Promise<void> {
    await this.cartRepository.saveCart({ userId });
  }

  async loadCart(): Promise<void> {
    if (this.#cart()) return;
    const userId = (await this.cache.get<AuthStatus>('authStatus'))?.userId ?? '';

    // Try to load real-time cart
    if (this.cartRepository.getCartByUserId$) {
      const cart$ = this.cartRepository.getCartByUserId$(userId);
      cart$?.subscribe(cart => {
        this.#cart.set(cart);
      });
      if (cart$) await firstValueFrom(cart$); 
      return;
    }

    // Else, load a snapshot
    const cart = await this.cartRepository.getCartByUserId(userId);
    this.#cart.set(cart);
  }

  async getCart$(): Promise<Observable<CartModel | null> | null> {
    if (!this.cartRepository.getCartByUserId$) return null;
    const userId = (await this.cache.get<AuthStatus>('authStatus'))?.userId ?? '';
    return this.cartRepository.getCartByUserId$(userId);
  }

  async addItemToCart(item: CartItemModel): Promise<void> {
    const cart: CartModel | null = this.#cart();
    if (!cart) return;

    if (cart.items.find(i => i.postId === item.postId)) {
      console.warn(`Item with postId ${item.postId} already exists in cart`);
      return; // Item already exists in cart
    }

    cart.items.push(item);
    await this.cartRepository.updateCart(cart);
  }

  async removeItemFromCart(postId: string): Promise<void> {
    const cart: CartModel | null = this.#cart();
    if (!cart) return;

    const index = cart.items.findIndex(i => i.postId === postId);
    if (index === -1) return;

    cart.items.splice(index, 1);
    await this.cartRepository.updateCart(cart);
  }

  async clearCart(): Promise<void> {
    const cart: CartModel | null = this.#cart();
    if (!cart) return;

    cart.items = [];
    await this.cartRepository.updateCart(cart);
  }
}
