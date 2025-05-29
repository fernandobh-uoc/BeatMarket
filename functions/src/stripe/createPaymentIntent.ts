import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getStripe } from '../stripe';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const createPaymentIntent = onCall(
  { 
    secrets: [stripeSecret] 
  }, 
  async (request) => {
    const { amount, currency, sellerStripeId } = request.data;

    if (!request.auth) throw new Error('User must be authenticated');

    const stripe = getStripe(stripeSecret.value());

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      payment_method_types: ['card'],
      transfer_data: {
        destination: sellerStripeId
      },
      metadata: {
        buyerUid: request.auth.uid,
      }
    });

    return {
      clientSecret: paymentIntent.client_secret
    };
  }
);