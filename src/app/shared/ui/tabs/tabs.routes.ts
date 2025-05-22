import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { latestPostsResolver, recommendedPostsResolver } from 'src/app/features/home/utils/resolvers/home.resolver';
import { postDetailResolver } from 'src/app/features/post-detail/utils/resolvers/post-detail.resolver';
import { userDetailResolver, userDetailResolver$ } from 'src/app/features/user-detail/utils/resolvers/user-detail.resolver';
import { boughtItemsResolver, soldItemsResolver } from 'src/app/features/history/utils/resolvers/history.resolver';
import { conversationsAsBuyerResolver, conversationsAsSellerResolver } from 'src/app/features/conversations/conversations-list/utils/resolvers/conversations-list.resolver';
//import { AuthGuard } from '../core/guards/auth.guard';

export const TabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('src/app/features/home/home.page').then(m => m.HomePage),
        /* resolve: {
          latestPosts: latestPostsResolver,
          recommendedPosts: recommendedPostsResolver
        } */
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
        loadChildren: () => import('src/app/features/sell/sell.routes').then(m => m.SellRoutes)
      },
      {
        path: 'conversations',
        loadComponent: () => import('src/app/features/conversations/conversations-list/conversations-list.page').then(m => m.ConversationsListPage),
        /* resolve: {
          conversationsAsBuyer: conversationsAsBuyerResolver,
          conversationsAsSeller: conversationsAsSellerResolver,
        } */
      },
      {
        path: 'post-detail/:postId',
        loadComponent: () => import('src/app/features/post-detail/post-detail.page').then(m => m.PostDetailPage),
        /* resolve: {
          postData: postDetailResolver,
        } */
      },
      {
        path: 'user-detail/:userId',
        loadComponent: () => import('src/app/features/user-detail/user-detail.page').then(m => m.UserDetailPage),
        resolve: {
          userData: userDetailResolver,
          userData$: userDetailResolver$
        }
      },
      {
        path: 'history',
        loadComponent: () => import('src/app/features/history/history.page').then(m => m.HistoryPage),
        /* resolve: {
          boughtItems: boughtItemsResolver,
          soldItems: soldItemsResolver
        } */
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