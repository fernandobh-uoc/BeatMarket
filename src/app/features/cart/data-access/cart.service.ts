import { signal, computed, inject, Injectable } from '@angular/core';
import { CartItem, CartModel } from 'src/app/core/domain/models/cart.model';
import { CartRepository } from 'src/app/core/domain/repositories/cart.repository';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { AuthStatus } from 'src/app/core/services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

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

  async addItemToCart(item: CartItem): Promise<void> {
    const cart: CartModel | null = this.#cart();
    if (!cart) return;
    cart.items.push(item);
    await this.cartRepository.updateCart(cart);
  }

  constructor() { }
}
