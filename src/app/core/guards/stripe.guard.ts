import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { StripeService } from 'src/app/features/stripe-setup/data-access/stripe.service';

export const stripeGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const stripeService = inject(StripeService);

  const user = authService.currentUser();
  if (!user) {
    router.navigate(['/auth/landing']);
    return false;
  }

  if (stripeService.stripeState().accountActive) {
    return true;
  }

  try {
    const functions = getFunctions();
    const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
    const result: any = await checkStatus();
    
    if (result.data?.isActive) {
      return true;
    } else {
      router.navigate(['/tabs/sell/stripe-setup']);
      return false;
    }
  } catch (err) {
    console.error('Stripe account check failed:', err);
    router.navigate(['/tabs/sell/stripe-setup']);
    return false;
  }
};