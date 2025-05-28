import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { stripeGuard } from './core/guards/stripe.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('src/app/features/authentication/auth.routes').then(m => m.AuthRoutes),
    canMatch: [authGuard],
    data: { authStateMustBe: false }
  },
  {
    path: '',
    loadChildren: () => import('./shared/ui/tabs/tabs.routes').then(m => m.TabsRoutes),
    canMatch: [authGuard],
    data: { authStateMustBe: true }
  },
  {
    path: 'cart',
    loadComponent: () => import('src/app/features/cart/cart.page').then(m => m.CartPage),
    canMatch: [authGuard],
    data: { authStateMustBe: true }
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CheckoutRoutes),
    canMatch: [authGuard],
    data: { authStateMustBe: true }
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.page').then(m => m.SearchPage)
  },
  {
    path: 'conversation/:conversationId',
    loadComponent: () => import('./features/conversations/conversation/conversation.page').then(m => m.ConversationPage)
  }
];
