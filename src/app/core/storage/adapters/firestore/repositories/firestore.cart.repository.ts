import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';

import { CartRepository } from '../../../../domain/repositories/cart.repository';
import { FirestoreAdapter } from '../firestore.adapter';
import { CartModel, Cart } from '../../../../domain/models/cart.model';
import { FirestoreCartConverter } from '../converters/firestore.cart.converter';

@Injectable({ providedIn: 'root' })
export class FirestoreCartRepository implements CartRepository {
  private firestore: FirestoreAdapter<Cart> = inject(FirestoreAdapter<CartModel>); 
  private cartConverter: FirestoreCartConverter = new FirestoreCartConverter();

  async getCartById(id: string): Promise<Cart | null> {
    try {
      return await this.firestore.getById(id, { collection: 'carts', converter: this.cartConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getCartById$(id: string): Observable<Cart | null> | null {
    try {
      return this.firestore.getById$(id, { collection: 'carts', converter: this.cartConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    try {
      const carts: Cart[] | null = await this.firestore.getByField('userId', userId, { collection: 'carts', converter: this.cartConverter });
      if (carts && carts.length > 0) {
        return carts[0];
      }
      return null;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getCartByUserId$(userId: string): Observable<Cart | null> | null {
    try {
      return this.firestore.getByField$('userId', userId, { collection: 'carts', converter: this.cartConverter }).pipe(
        map(carts => carts && carts.length > 0 ? carts[0] : null)
      );
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getAllCarts(): Promise<Cart[] | null> {
    try {
      return await this.firestore.getCollection({ collection: 'carts', converter: this.cartConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getAllCarts$(): Observable<Cart[] | null> | null {
    try {
      return this.firestore.getCollection$({ collection: 'carts', converter: this.cartConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async saveCart(cartData: Partial<CartModel>): Promise<Cart | null> {
    try {
      const _cart: Cart = Cart.Build(cartData);
      let cart: Cart | null;
      if (cart = await this.firestore.create(_cart, { collection: 'carts', converter: this.cartConverter })) {
        return cart;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async updateCart(cartData: Partial<CartModel> & { _id: string }): Promise<Cart | null> {
    try {
      let cart: Cart | null;
      if (cart = await this.firestore.update(cartData, { collection: 'carts', converter: this.cartConverter })) {
        return cart;
      }
      return null;
    } catch (firestoreError) {
      console.error(firestoreError);
    }
    return null;
  }

  async deleteCart(id: string): Promise<boolean> {
    try {
      return await this.firestore.remove(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async cartExists(id: string): Promise<boolean> {
    try {
      return await this.firestore.exists(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }
}