import { Routes } from "@angular/router";

export const SellRoutes: Routes = [
  {
    path: 'publish',
    loadComponent: () => import('src/app/features/sell/pages/publish/publish.page').then(m => m.PublishPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('src/app/features/sell/pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: '',
    redirectTo: 'publish',
    pathMatch: 'full'
  }
];