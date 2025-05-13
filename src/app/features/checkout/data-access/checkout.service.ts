import { computed, inject, Injectable } from '@angular/core';
import { CartService } from '../../cart/data-access/cart.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  authService = inject(AuthService);
  cartService = inject(CartService);
  saleRepository = inject(SaleRepository);

  userFullName = computed<string>(() => this.authService.currentUser()?.fullName ?? '');

  cartItems = computed<CartItemModel[]>(() => this.cartService.cart()?.items ?? []);

  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());

  constructor() { }

  async checkout() {
    console.log('checkout');
  }
}
