import { Routes } from "@angular/router";

export const SellRoutes: Routes = [
  {
    path: 'sell',
    loadComponent: () => import('src/app/features/sell/pages/sell/sell.page').then(m => m.SellPage)
  },
  {
    path: 'sell/splash',
    loadComponent: () => import('src/app/features/sell/pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: '',
    redirectTo: 'sell',
    pathMatch: 'full'
  }
];