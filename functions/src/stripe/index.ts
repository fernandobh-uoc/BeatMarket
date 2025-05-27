import Stripe from 'stripe';

import { defineSecret } from 'firebase-functions/params';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

//export const stripe = new Stripe(stripeSecret.value());
export function getStripe() {
  return new Stripe(stripeSecret.value());
}

export * from './createAccount';
export * from './onboardingLink';