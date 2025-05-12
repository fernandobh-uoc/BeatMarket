import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { postDetailResolver, postDetailResolver$ } from './features/post-detail/utils/resolvers/post-detail.resolver';
import { cartItemsResolver, cartItemsResolver$ } from './features/cart/utils/resolvers/cart-items.resolver';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('src/app/features/authentication/auth.routes').then(m => m.AuthRoutes),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: '',
    loadChildren: () => import('./shared/ui/tabs/tabs.routes').then(m => m.TabsRoutes),
    canMatch: [authGuard],
    data: { authStatusMustBe: true }
  },
  {
    path: 'cart',
    loadComponent: () => import('src/app/features/cart/cart.page').then(m => m.CartPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: true },
    resolve: {
      cartItems$: cartItemsResolver$
    }
  },
  {
    path: 'splash',
    loadComponent: () => import('src/app/features/sell/pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'user-detail',
    loadComponent: () => import('./features/user-detail/user-detail.page').then(m => m.UserDetailPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.page').then(m => m.CheckoutPage)
  }
];
