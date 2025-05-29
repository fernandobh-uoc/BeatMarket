import { Component, computed, effect, inject, linkedSignal, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonButton, IonSpinner, IonInput, IonLabel } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { CheckoutFormComponent } from '../../ui/checkout-form/checkout-form.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CheckoutService } from '../../data-access/checkout.service';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { Router } from '@angular/router';
import { StripeCardComponent } from '../../ui/stripe-card/stripe-card.component';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: true,
  imports: [IonLabel, IonInput, StripeCardComponent, IonSpinner, ToolbarComponent, CheckoutFormComponent, IonButton, IonText, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class PaymentPage implements OnInit, ViewWillEnter {
  router = inject(Router);
  checkoutService = inject(CheckoutService);

  step = signal<number>(1);
  totalSteps = 2;
  progressBarValue = computed(() => this.step() / this.totalSteps);

  stripeCardComponent = viewChild<StripeCardComponent>('stripeCardComponent');
  stripeCardInstance = signal<Stripe | null>(null);
  stripeCardElement = signal<StripeCardElement | null>(null);
  //@ViewChild('stripeCardComponent') stripeCardComponent!: StripeCardComponent;

  /* checkoutFormComponent = viewChild(CheckoutFormComponent);
  checkoutFormData = signal<Record<string, any>>({});
  submitAttempted = signal<boolean>(false); */

  //disabledCheckoutButton = signal<boolean>(false);
  stripeCardReady = signal<boolean>(false);
  stripeCardComplete = signal<boolean>(false);
  stripeCardError = signal<string | null>(null);

  cardName = linkedSignal<string>(() => this.checkoutService.checkoutState().currentUser.fullName ?? '');
  cartItems = computed<CartItemModel[]>(() => this.checkoutService.checkoutState().cartItems ?? []);
  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());
  
  checkoutLoading = computed(() => this.checkoutService.checkoutState().loading);

  constructor() {
    effect(() => {
      console.log(this.stripeCardElement());
    })
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.step.set(1);
  }

  nextStep() {
    this.step.set(this.step() + 1);
  }
  
  prevStep() {
    this.step.set(1);
  }

  onStripeCardReady() {
    this.stripeCardReady.set(true);
    this.stripeCardError.set(null);
    console.log('Stripe card ready');
  }

  onStripeCardComplete() {
    this.stripeCardInstance.set(this.stripeCardComponent()?.stripe ?? null);
    this.stripeCardElement.set(this.stripeCardComponent()?.card ?? null); 
    this.stripeCardComplete.set(true);
    this.stripeCardError.set(null);
    console.log('Stripe card complete');
  }
  
  onStripeCardError(errorMessage: string | null) {
    //this.stripeCardElement.set(null);
    this.stripeCardError.set(errorMessage);
    if (errorMessage) {
      console.error(errorMessage);
    }
  }

  goToSummary() {
    if (this.stripeCardReady() && !this.stripeCardError()) {
      this.nextStep();
    }
  }

  async handleCheckout() {
    console.log("handle checkout");
    console.log(this.stripeCardElement());

    if (!this.stripeCardElement()) return;
    try {
      await this.checkoutService.checkout({
        stripeInstance: this.stripeCardInstance()!,
        stripeCardElement: this.stripeCardElement()!,
        cardName: this.cardName()
      });
      this.router.navigate(['/checkout/splash']);
      
    } catch (error) {
      console.error(error);
    }
  }

}
