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
    loadComponent: () => import('./shared/tabs/tabs.page').then(m => m.TabsPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: true }
  },
];
