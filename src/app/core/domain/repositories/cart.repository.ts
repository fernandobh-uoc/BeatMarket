import { inject, Injectable } from '@angular/core';
import { Cart, CartModel } from '../models/cart.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { CartConverter } from '../../services/storage/adapters/converters/cart.converter';
import { map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartRepository {
  private storage = inject<Storage<Cart>>(environment.storageTokens.cart);
  private cartConverter: CartConverter; 
  //private converter: CartConverter;

  constructor() {
    this.cartConverter = new CartConverter();
  }

  async getCartById(id: string): Promise<Cart | null> {
    try {
      return await this.storage.getById(id, { collection: 'carts', converter: this.cartConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getCartById$(id: string): Observable<Cart | null> | null {
    if (!this.storage.getById$) return null;
    try {
      return this.storage.getById$(id, { collection: 'carts', converter: this.cartConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    try {
      const carts: Cart[] | null = await this.storage.getByField('userId', userId, { collection: 'carts', converter: this.cartConverter });
      if (carts && carts.length > 0) {
        return carts[0];
      }
      return null;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getCartByUserId$(userId: string): Observable<Cart | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('userId', userId, { collection: 'carts', converter: this.cartConverter }).pipe(
        map(carts => carts && carts.length > 0 ? carts[0] : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getAllCarts(): Promise<Cart[] | null> {
    if (!this.storage.getCollection) return null;

    try {
      return await this.storage.getCollection({ collection: 'carts', converter: this.cartConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getAllCarts$(): Observable<Cart[] | null> | null {
    if (!this.storage.getCollection$) return null;

    try {
      return this.storage.getCollection$({ collection: 'carts', converter: this.cartConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async saveCart(cartData: Partial<CartModel>): Promise<Cart | boolean | null> {
    try {
      const cart: Cart = Cart.Build(cartData);
      if (await this.storage.create(cart, { collection: 'carts', converter: this.cartConverter })) {
        return cart;
      }
      return false;
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async updateCart(cartData: Partial<CartModel> & { _id: string }): Promise<Cart | boolean | null> {
    try {
      //const cart: Cart = Cart.Build(cartData);
      if (await this.storage.update(cartData, { collection: 'carts', converter: this.cartConverter })) {
        return true;
      }
      return false;
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async cartExists(id: string): Promise<boolean> {
    return await this.storage.exists(id);
  }
}