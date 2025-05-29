import Stripe from 'stripe';

export function getStripe(secretKey: string) {
  return new Stripe(secretKey);
}

export * from './createAccount';
export * from './onboardingLink';
export * from './checkAccountStatus';
export * from './createPaymentIntent';