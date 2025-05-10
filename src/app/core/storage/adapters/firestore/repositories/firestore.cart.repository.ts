import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';

import { CartRepository } from '../../../../domain/repositories/cart.repository';
import { Storage } from '../../../storage.interface';
import { FirebaseFirestoreAdapter } from '../firebase-firestore.adapter';
import { CartModel, Cart } from '../../../../domain/models/cart.model';
import { FirestoreCartConverter } from '../converters/firestore.cart.converter';

@Injectable({ providedIn: 'root' })
export class FirestoreCartRepository implements CartRepository {
  private storage: Storage<Cart> = inject(FirebaseFirestoreAdapter<CartModel>); 
  private cartConverter: FirestoreCartConverter = new FirestoreCartConverter();

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

  async saveCart(cartData: Partial<CartModel>): Promise<Cart | null> {
    try {
      const _cart: Cart = Cart.Build(cartData);
      let cart: Cart | null;
      if (cart = await this.storage.create(_cart, { collection: 'carts', converter: this.cartConverter })) {
        return cart;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async updateCart(cartData: Partial<CartModel> & { _id: string }): Promise<Cart | null> {
    try {
      let cart: Cart | null;
      if (cart = await this.storage.update(cartData, { collection: 'carts', converter: this.cartConverter })) {
        return cart;
      }
      return null;
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async deleteCart(id: string): Promise<boolean> {
    try {
      return await this.storage.remove(id);
    } catch (storageError) {
      throw storageError;
    }
  }

  async cartExists(id: string): Promise<boolean> {
    try {
      return await this.storage.exists(id);
    } catch (storageError) {
      throw storageError;
    }
  }
}