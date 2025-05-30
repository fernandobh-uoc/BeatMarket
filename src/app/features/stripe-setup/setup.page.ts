import { Component, computed, inject, linkedSignal, OnInit, OnDestroy, signal, effect } from '@angular/core';
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

  loadingAccountStatus = linkedSignal(() => this.stripeService.stripeState().loading.accountStatus);
  loadingOnboardingLink = computed(() => this.stripeService.stripeState().loading.onboardingLink);
  errorMessage = computed<string>(() => this.stripeService.stripeState().errorMessage);

  constructor() {}

  async ngOnInit() {
    Browser.addListener('browserFinished', async () => {
      await this.stripeService.getStripeAccountStatus();
      const isActive = this.accountActive();
      if (isActive) {
        this.router.navigate(['/tabs/sell/publish']);
      } else {
        await this.stripeService.getStripeOnboardingLink();
      }
    })
  }

  async ngOnDestroy() {
    Browser.removeAllListeners();
  }
  
  async ionViewDidEnter() {
    if (!this.accountActive()) {
      await this.stripeService.getStripeAccountStatus();
    }
    
    if (this.accountActive()) {
      this.router.navigate(['/tabs/sell/publish'])
      return;
    }

    // Renew the onboarding link every time the view is entered
    await this.stripeService.getStripeOnboardingLink();
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
}
