import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { getStripe } from './index';

export const generateStripeOnboardingLink = onCall(async (request) => {
  if (!request.auth) throw new Error('User must be logged in');

  const uid = request.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  const stripe = getStripe();
  const stripeAccountId = userDoc.data()?.stripeAccountId;

  if (!stripeAccountId) {
    throw new Error('Stripe account not found');
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: 'https://yourapp.com/reauth',
    return_url: 'https://yourapp.com/return',
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
});