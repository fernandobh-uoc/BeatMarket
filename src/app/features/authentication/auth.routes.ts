import { Routes } from "@angular/router";
import { authGuard } from "src/app/core/guards/auth.guard";

export const AuthRoutes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.page').then(m => m.WelcomePage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  }
]