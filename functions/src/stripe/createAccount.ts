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
      email: userData?.email,
      individual: {
        first_name: userData?.name?.first,
        last_name: userData?.name?.last,
        address: {
          line1: userData?.address.line1,
          line2: userData?.address.line2,
          postal_code: userData?.address.zipcode,
          city: userData?.address.city,
        }
      },
      country: userData?.address.countryCode,
    })

    await db.collection('users').doc(userId).update({
      stripeAccountId: account.id
    })
  }
);