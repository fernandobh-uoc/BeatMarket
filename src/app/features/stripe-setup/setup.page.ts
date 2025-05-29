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
import { ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, ToolbarComponent, IonButton, IonContent, IonHeader, CommonModule, FormsModule] 
})
export class SetupPage implements OnInit, OnDestroy, ViewDidEnter {
  private router = inject(Router);
  private stripeService = inject(StripeService);

  redirectTo = signal<string>('');

  accountActive = computed(() => this.stripeService.stripeState().accountActive);
  stripeOnboardingUrl = computed(() => this.stripeService.stripeState().onboardingLink);

  loadingAccountStatus = computed(() => this.stripeService.stripeState().loading.accountStatus);
  loadingOnboardingLink = computed(() => this.stripeService.stripeState().loading.onboardingLink);
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

  async ionViewDidEnter() {
    await this.stripeService.getStripeAccountStatus();

    //this.accountActive.set(true);
    //this.router.navigate(['/tabs/sell/publish']);

    if (this.accountActive()) {
      this.router.navigate(['/tabs/sell/publish']);
      return;
    }

    console.log("getting onboarding link");
    // Renew the onboarding link every time for now
    await this.stripeService.getStripeOnboardingLink();
    console.log({ url: this.stripeOnboardingUrl() });
  }

  async ngOnInit() {
    /* const nav = this.router.getCurrentNavigation();
    const urls = {
      '/publish': '/tabs/sell/publish',
      '/checkout': '/checkout/payment',
    }
    const fromUrlKey = nav?.extras?.state?.['fromUrl'];
    if (fromUrlKey === '/publish' || fromUrlKey === '/checkout') {
      this.redirectTo.set(urls[fromUrlKey as '/publish' | '/checkout']);
    } */

    /* await this.stripeService.getStripeAccountStatus();

    this.accountActive.set(true);

    if (this.accountActive()) {
      this.router.navigate(['/tabs/sell/publish']);
      return;
    }
      */

    if (!this.stripeOnboardingUrl()) {
      await this.stripeService.getStripeOnboardingLink();
      console.log({ url: this.stripeOnboardingUrl() });
    }

    Browser.addListener('browserFinished', async () => {
      console.log("browserFinished");
      await this.stripeService.getStripeAccountStatus();
      const isActive = this.accountActive();
      console.log({ isActive });
      if (isActive) {
        this.router.navigate(['/tabs/sell/publish']);
      }
    })
  }

  async ngOnDestroy() {
    Browser.removeAllListeners();
  }

}
