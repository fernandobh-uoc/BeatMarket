import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { latestPostsResolver, recommendedPostsResolver } from 'src/app/features/home/utils/resolvers/home.resolver';
//import { AuthGuard } from '../core/guards/auth.guard';

export const TabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('src/app/features/home/home.page').then(m => m.HomePage),
        resolve: {
          latestPosts: latestPostsResolver,
          recommendedPosts: recommendedPostsResolver
        }
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