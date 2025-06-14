import { computed, effect, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { getFunctions, HttpsCallable, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { loadStripe, PaymentIntent, PaymentIntentResult, Stripe, StripeCardElement } from '@stripe/stripe-js'
import { environment } from 'src/environments/environment.dev';

type StripeState = {
  accountActive: boolean,
  onboardingLink: string | null,
  loading: {
    accountStatus: boolean,
    onboardingLink: boolean,
    paymentIntent: boolean,
    paymentConfirmation: boolean
  },
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private authService = inject(AuthService);

  private accountActive = linkedSignal<boolean>(() => { 
    if (!this.authService.authState().isAuthenticated) return false; 
    return false;
  });  
  private onboardingLink = signal<string | null>(null);
  private loadingAccountStatus = signal<boolean>(true);
  private loadingOnboardingLink = signal<boolean>(false);
  private loadingPaymentIntent = signal<boolean>(false);
  private loadingPaymentConfirmation = signal<boolean>(false);
  private errorMessage = signal<string>('');

  stripeState = computed<StripeState>(() => ({
    accountActive: this.accountActive(),
    onboardingLink: this.onboardingLink(),
    loading: {
      accountStatus: this.loadingAccountStatus(),
      onboardingLink: this.loadingOnboardingLink(),
      paymentIntent: this.loadingPaymentIntent(),
      paymentConfirmation: this.loadingPaymentConfirmation()
    },
    errorMessage: this.errorMessage()
  }));

  constructor() {}

  async getStripeAccountStatus(): Promise<void> {
    this.loadingAccountStatus.set(true);
    try {
      const functions = getFunctions();
      const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
      const result: any = await checkStatus();

      this.errorMessage.set('');
      this.accountActive.set(result.data?.isActive);
    } catch (err) {
      console.error('Stripe account check failed:', err);
      this.errorMessage.set('Error al comprobar el estado de la cuenta de Stripe');
    } finally {
      this.loadingAccountStatus.set(false);
    }
  }

  async getStripeOnboardingLink(): Promise<void> {
    this.loadingOnboardingLink.set(true);
    try {
      const functions = getFunctions();
      const getLink = httpsCallable(functions, 'createStripeOnboardingLink');
      const linkResult: any = await getLink();
      this.errorMessage.set('');
      this.onboardingLink.set(linkResult.data.url);
    } catch (err) {
      console.error('Stripe account check failed:', err);
      this.errorMessage.set('Error al generar el enlace de activación de Stripe');
    } finally {
      this.loadingOnboardingLink.set(false);
    }
  }

  async createPaymentIntent({ totalAmount, currency = 'eur', sellerStripeId }: { totalAmount: number, currency: string, sellerStripeId: string }): Promise<{ clientSecret: string | null } | null> {
    this.loadingPaymentIntent.set(true);
    try {
      const functions = getFunctions();
      const createPaymentIntent = httpsCallable<{ amount: number, currency: string, sellerStripeId: string }, { clientSecret: string | null }>(functions, 'createPaymentIntent');
      const paymentIntent = await createPaymentIntent({
        amount: totalAmount,
        currency,
        sellerStripeId
      });

      return paymentIntent.data;
    } catch (err) {
      console.error('Stripe payment intent creation failed:', err);
      this.errorMessage.set('Error al crear el pago con Stripe');
    } finally {
      this.loadingPaymentIntent.set(false);
    }
    return null;
  }

  async confirmPayment({ stripeInstance, clientSecret, stripeCard, cardName }: { stripeInstance: Stripe, clientSecret: string, stripeCard: StripeCardElement, cardName?: string }): Promise<PaymentIntentResult | null> { 
    if (!stripeInstance) return null;

    try {

      const result: PaymentIntentResult = await stripeInstance?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: stripeCard,
          billing_details: {
            name: cardName ?? this.authService.currentUser()?.fullName
          }
        }
      })
  
      if (!result) {
        this.errorMessage.set('Error al confirmar el pago');
      }
  
      if (result.error) {
        this.errorMessage.set(result.error.message ?? 'Error al confirmar el pago');
      }
  
      const errors: Record<string, string> = {
        'canceled': 'Pago cancelado',
        'processing': 'Pago en proceso',
        'requires_action': 'Pago pendiente de aprobación',
        'requires_capture': 'Pago pendiente de captura',
        'requires_confirmation': 'Pago pendiente de confirmación',
        'requires_payment_method': 'Pago pendiente de pago con tarjeta'
      }
  
      const status = result.paymentIntent?.status;
      if (status && errors[status]) {
        this.errorMessage.set(errors[status]);
      }
  
      return result;
    } catch (err) {
      console.error('Stripe payment intent confirmation failed:', err);
      this.errorMessage.set('Error al confirmar el pago');
      return null;
    }
  }
}
