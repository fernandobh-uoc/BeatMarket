import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getStripe } from './index';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const checkStripeAccountStatus = onCall(
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
      return false;
      //throw new Error('Stripe account not found');
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;

    const isActive = chargesEnabled && payoutsEnabled && detailsSubmitted;

    return { isActive };
  }
);