import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CartService } from '../../data-access/cart.service';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { pipe, map, of, Observable } from 'rxjs';

export const cartItemsResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const cartItemsResolver$: ResolveFn<Observable<CartItemModel[] | null> | null>= async (route, state) => {
  const cartService = inject(CartService);
  return (await cartService.getCart$() ?? of(null)).pipe(map(cart => cart?.items ?? [])); 
}
