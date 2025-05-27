import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getStripe } from '../stripe';

const db = admin.firestore();

export const createStripeAccount = onDocumentCreated('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const userData = event.data?.data();
  const stripe = getStripe();

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
})