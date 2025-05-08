import { InjectionToken } from '@angular/core';
import { Observable } from "rxjs/internal/Observable";
import { CartModel, Cart } from "../models/cart.model";

export const CartRepository = new InjectionToken<CartRepository>('CartRepository');

export interface CartRepository {
  getCartById(id: string): Promise<Cart | null>;
  getCartById$?(id: string): Observable<Cart | null> | null;
  getCartByUserId(userId: string): Promise<Cart | null>;
  getCartByUserId$?(userId: string): Observable<Cart | null> | null;  
  getAllCarts(): Promise<Cart[] | null>;
  getAllCarts$?(): Observable<Cart[] | null> | null;
  saveCart(cartData: Partial<CartModel>): Promise<Cart | boolean | null>;
  updateCart(cartData: Partial<CartModel> & { _id: string }): Promise<Cart | boolean | null>;  
  deleteCart(id: string): Promise<boolean>;
  cartExists(id: string): Promise<boolean>;
}