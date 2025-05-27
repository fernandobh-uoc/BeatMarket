import { Component, computed, inject, linkedSignal, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonText, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { StripeService } from 'src/app/features/stripe-setup/data-access/stripe.service';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { getFunctions, httpsCallable } from 'firebase/functions';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, ToolbarComponent, IonButton, IonContent, IonHeader, CommonModule, FormsModule] 
})
export class SetupPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private stripeService = inject(StripeService);

  redirectTo = signal<string>('');

  stripeOnboardingUrl = computed(() => this.stripeService.stripeState().onboardingLink);
  loading = linkedSignal<boolean>(() => this.stripeService.stripeState().loading);
  errorMessage = computed<string>(() => this.stripeService.stripeState().errorMessage);

  constructor() { 
    /* const nav = this.router.getCurrentNavigation();
    const onboardingUrl = nav?.extras?.state?.['stripeOnboardingUrl'] ?? null;
    this.stripeOnboardingUrl.set(onboardingUrl); */
  }

  goToStripe() {
    const url = this.stripeOnboardingUrl();
    if (url) {
      if (Capacitor.isNativePlatform()) {
        Browser.open({ url });
      } else {
        window.open(url, '_blank');
      }
    }
  }

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const urls = {
      '/publish': '/tabs/sell/publish',
      '/checkout': '/checkout/payment',
    }
    const fromUrlKey = nav?.extras?.state?.['fromUrl'];
    if (fromUrlKey === '/publish' || fromUrlKey === '/checkout') {
      this.redirectTo.set(urls[fromUrlKey as '/publish' | '/checkout']);
    }

    if (!this.stripeOnboardingUrl()) {
      await this.stripeService.getStripeOnboardingLink();
      console.log({ url: this.stripeOnboardingUrl() });
    }

    Browser.addListener('browserFinished', async () => {
      console.log("browserFinished");
      const isActive =await this.getStripeAccountStatus();
      if (isActive) {
        this.router.navigate([this.redirectTo()]);
      }
    })
  }

  async getStripeAccountStatus() {
    const functions = getFunctions();
    const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
    const result: any = await checkStatus();

    return result.data?.isActive;

    //console.log({result});

    if (result.data?.isActive) {
      this.router.navigate(['/tabs/sell/setup']);
    }
  }

  async ngOnDestroy() {
    Browser.removeAllListeners();
  }

}
