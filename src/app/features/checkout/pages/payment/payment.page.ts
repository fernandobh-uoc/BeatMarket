import { Component, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { CheckoutFormComponent } from '../../ui/checkout-form/checkout-form.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CheckoutService } from '../../data-access/checkout.service';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: true,
  imports: [IonSpinner, ToolbarComponent, CheckoutFormComponent, IonButton, IonText, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class PaymentPage implements OnInit {
  router = inject(Router);
  checkoutService = inject(CheckoutService);

  step = signal<number>(1);
  totalSteps = 2;
  progressBarValue = computed(() => this.step() / this.totalSteps);

  checkoutFormComponent = viewChild(CheckoutFormComponent);
  checkoutFormData = signal<Record<string, any>>({});
  submitAttempted = signal<boolean>(false);

  //disabledCheckoutButton = signal<boolean>(false);
  loading = computed(() => this.checkoutService.checkoutState().loading);

  userFullName = computed<string>(() => this.checkoutService.checkoutState().currentUser.fullName ?? '');
  cartItems = computed<CartItemModel[]>(() => this.checkoutService.checkoutState().cartItems ?? []);
  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());


  constructor() { }

  ngOnInit() {
  }

  nextStep() {
    this.step.set(this.step() + 1);
  }
  
  prevStep() {
    this.step.set(1);
  }

  onControlFocus(control: string) {
    this.submitAttempted.set(false);
  }

  handleFormSubmit() {
    this.submitAttempted.set(true);

    if (this.checkoutFormComponent()?.checkoutForm?.invalid) {
      return;
    }

    this.checkoutFormData.set(this.checkoutFormComponent()?.checkoutForm?.value);
    this.nextStep();
  }

  async handleCheckout() {
    try {
      await this.checkoutService.checkout({
        items: this.cartItems(),
        paymentData: this.checkoutFormData()
      });
      this.router.navigate(['/checkout/splash']);
    } catch (error) {
      console.error(error);
    }
  }

}
