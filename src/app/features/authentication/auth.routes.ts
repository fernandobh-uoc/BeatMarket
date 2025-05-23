import { Routes } from "@angular/router";
import { authGuard } from "src/app/core/guards/auth.guard";

export const AuthRoutes: Routes = [
  {
    path: 'landing',
    loadComponent: () => import('./landing/landing.page').then(m => m.LandingPage),
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
    path: 'password-reset',
    loadComponent: () => import('./password-reset/pages/password-reset/password-reset.page').then(m => m.PasswordResetPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: 'password-reset-email-sent',
    loadComponent: () => import('./password-reset/pages/password-reset-email-sent/password-reset-email-sent.page').then(m => m.PasswordResetEmailSentPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/pages/register/register.page').then(m => m.RegisterPage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: 'welcome',
    loadComponent: () => import('./register/pages/welcome/welcome.page').then(m => m.WelcomePage),
    canMatch: [authGuard],
    data: { authStatusMustBe: false }
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  }
]