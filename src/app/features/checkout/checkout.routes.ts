import { Routes } from "@angular/router";

export const CheckoutRoutes: Routes = [
  {
    path: '',
    redirectTo: 'payment',
    pathMatch: 'full'
  },
  {
    path: 'payment',
    loadComponent: () => import('src/app/features/checkout/pages/payment/payment.page').then(m => m.PaymentPage) 
  },
  {
    path: 'splash',
    loadComponent: () => import('src/app/features/checkout/pages/splash/splash.page').then(m => m.SplashPage) 
  },
];