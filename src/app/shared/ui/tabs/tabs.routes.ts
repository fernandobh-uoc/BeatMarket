import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from 'src/app/core/guards/auth.guard';
//import { AuthGuard } from '../core/guards/auth.guard';

export const TabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('src/app/features/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'profile',
        loadComponent: () => import('src/app/features/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'sell',
        loadChildren: () => import('src/app/features/sell/sell.routes').then(m => m.SellRoutes)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
]