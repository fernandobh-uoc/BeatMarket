import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { getStripe } from '../stripe';

const db = admin.firestore();
const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const createStripeAccount = onDocumentCreated(
  {
    document: 'users/{userId}',
    secrets: [stripeSecret]
  }, 
  async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();
    const stripe = getStripe(stripeSecret.value());

    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      email: userData?.email
    })

    await db.collection('users').doc(userId).update({
      stripeAccountId: account.id
    })
  }
);