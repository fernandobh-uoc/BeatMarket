import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonButton } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { CheckoutFormComponent } from './ui/checkout-form/checkout-form.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CheckoutService } from './data-access/checkout.service';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [ToolbarComponent, CheckoutFormComponent, IonButton, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class CheckoutPage implements OnInit {
  router = inject(Router);
  checkoutService = inject(CheckoutService);

  step = signal<number>(2);
  totalSteps = 2;
  progressBarValue = computed(() => this.step() / this.totalSteps);

  userFullName = computed<string>(() => this.checkoutService.userFullName() ?? '');
  cartItems = computed<CartItemModel[]>(() => this.checkoutService.cartItems() ?? []);
  itemsArticlesTotal = computed<number>(() => this.checkoutService.itemsArticlesTotal());
  itemsShippingTotal = computed<number>(() => this.checkoutService.itemsShippingTotal());
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());

  checkoutFormComponent = viewChild(CheckoutFormComponent);

  submitAttempted = signal<boolean>(false);

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

    console.log(this.checkoutFormComponent()?.checkoutForm?.value);
    this.nextStep();
  }

  async handleCheckout() {
    try {
      await this.checkoutService.checkout();
      this.router.navigate(['/checkout/splash']);
    } catch (error) {
      console.error(error);
    }
  }

}
