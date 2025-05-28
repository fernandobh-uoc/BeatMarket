import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getStripe } from './index';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const generateStripeOnboardingLink = onCall(
  {
    secrets: [stripeSecret]
  },
  async (request) => {
    if (!request.auth) throw new Error('User must be logged in');

    const uid = request.auth.uid;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const stripe = getStripe(stripeSecret.value());
    const stripeAccountId = userDoc.data()?.stripeAccountId;

    if (!stripeAccountId) {
      throw new Error('Stripe account not found');
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding'
    });

    return { url: accountLink.url };
  }
);