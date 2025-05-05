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
  #cart = signal<CartModel | null>(null);
  #cartItemsAmount = computed<number>(() => this.#cart()?.items.length ?? 0);

  #cartRepository = inject(CartRepository);
  #cache = inject(LocalStorageService);

  get cart() {
    return this.#cart.asReadonly();
  }

  get cartItemsAmount() {
    return this.#cartItemsAmount;
  }

  async createCart(userId: string): Promise<void> {
    await this.#cartRepository.saveCart({ userId });
  }

  async loadCart(): Promise<void> {
    if (!this.#cart()) {
      const userId = (await this.#cache.get<AuthStatus>('authStatus'))?.userId ?? '';
      const cart$ = this.#cartRepository.getCartByUserId$(userId);
      cart$?.subscribe(cart => {
        this.#cart.set(cart);
      });
      if (cart$) await firstValueFrom(cart$);
      console.log(this.#cart());
    }
  }

  async addItemToCart(item: CartItem): Promise<void> {
    const cart: CartModel | null = this.#cart();
    if (!cart) return;
    cart.items.push(item);
    await this.#cartRepository.updateCart(cart);
  }

  constructor() { }
}
