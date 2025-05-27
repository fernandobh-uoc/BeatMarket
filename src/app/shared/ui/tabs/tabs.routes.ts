import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const TabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('src/app/features/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'search',
        loadComponent: () => import('src/app/features/search/search.page').then(m => m.SearchPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('src/app/features/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'sell',
        loadChildren: () => import('src/app/features/sell/sell.routes').then(m => m.SellRoutes),
      },
      {
        path: 'conversations',
        loadComponent: () => import('src/app/features/conversations/conversations-list/conversations-list.page').then(m => m.ConversationsListPage),
      },
      {
        path: 'post-detail/:postId',
        loadComponent: () => import('src/app/features/post-detail/post-detail.page').then(m => m.PostDetailPage),
      },
      {
        path: 'user-detail/:userId',
        loadComponent: () => import('src/app/features/user-detail/user-detail.page').then(m => m.UserDetailPage),
      },
      {
        path: 'history',
        loadComponent: () => import('src/app/features/history/history.page').then(m => m.HistoryPage),
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