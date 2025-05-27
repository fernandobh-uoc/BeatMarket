import { computed, Injectable, signal } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';

type StripeState = {
  onboardingLink: string | null,
  loading: boolean,
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private onboardingLink = signal<string | null>(null);
  private loading = signal<boolean>(false);
  private errorMessage = signal<string>('');

  stripeState = computed<StripeState>(() => ({
    onboardingLink: this.onboardingLink(),
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));

  constructor() { }

  async getStripeOnboardingLink(): Promise<void> {
    if (this.onboardingLink()) {
      return;
    }
    
    this.loading.set(true);
    try {
      const functions = getFunctions();
      const getLink = httpsCallable(functions, 'generateStripeOnboardingLink');
      const linkResult: any = await getLink();
      this.errorMessage.set('');
      this.onboardingLink.set(linkResult.data.url);
    } catch (err) {
      console.error('Stripe account check failed:', err);
      this.errorMessage.set('Error al generar el enlace de activación de Stripe');
    }
    this.loading.set(false);
  }
}
