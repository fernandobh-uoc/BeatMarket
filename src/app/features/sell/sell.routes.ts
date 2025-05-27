import { Routes } from "@angular/router";
import { stripeGuard } from "src/app/core/guards/stripe.guard";

export const SellRoutes: Routes = [
  {
    path: '',
    redirectTo: 'publish',
    pathMatch: 'full'
  },
  {
    path: 'publish',
    loadComponent: () => import('src/app/features/sell/pages/publish/publish.page').then(m => m.PublishPage),
    canMatch: [stripeGuard]
  },
  {
    path: 'splash',
    loadComponent: () => import('src/app/features/sell/pages/splash/splash.page').then(m => m.SplashPage)
  },
];
