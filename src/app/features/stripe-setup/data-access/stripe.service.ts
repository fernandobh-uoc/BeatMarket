import { computed, inject, Injectable, signal } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AuthService } from 'src/app/core/services/auth/auth.service';

type StripeState = {
  accountActive: boolean,
  onboardingLink: string | null,
  loading: {
    accountStatus: boolean,
    onboardingLink: boolean
  },
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private authService = inject(AuthService);

  private accountActive = signal<boolean>(false);
  private onboardingLink = signal<string | null>(null);
  private loadingAccountStatus = signal<boolean>(true);
  private loadingOnboardingLink = signal<boolean>(false);
  private errorMessage = signal<string>('');

  stripeState = computed<StripeState>(() => ({
    accountActive: this.accountActive(),
    onboardingLink: this.onboardingLink(),
    loading: {
      accountStatus: this.loadingAccountStatus(),
      onboardingLink: this.loadingOnboardingLink()
    },
    errorMessage: this.errorMessage()
  }));

  constructor() { }

  async getStripeAccountStatus(): Promise<void> {
    this.loadingAccountStatus.set(true);
    try {
      const functions = getFunctions();
      const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
      const result: any = await checkStatus();

      this.loadingAccountStatus.set(false);
      this.errorMessage.set('');
      this.accountActive.set(result.data?.isActive);
    } catch (err) {
      console.error('Stripe account check failed:', err);
      this.errorMessage.set('Error al comprobar el estado de la cuenta de Stripe');
      this.loadingAccountStatus.set(false);
    }
  }

  async getStripeOnboardingLink(): Promise<void> {
    if (this.onboardingLink()) {
      return;
    }
    
    this.loadingOnboardingLink.set(true);
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
    this.loadingOnboardingLink.set(false);
  }
}
