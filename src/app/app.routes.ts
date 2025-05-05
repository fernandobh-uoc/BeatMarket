import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/authentication/auth.routes').then(m => m.AuthRoutes),
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
    loadComponent: () => import('./features/cart/cart.page').then( m => m.CartPage)
  }
];
