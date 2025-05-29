import { AfterViewInit, Component, ElementRef, OnInit, output, signal, Signal, viewChild } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment.dev';
import { IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-stripe-card',
  templateUrl: './stripe-card.component.html',
  styleUrls: ['./stripe-card.component.scss'],
  imports: [IonText, ]
})
export class StripeCardComponent  implements AfterViewInit {
  private stripeInstance!: Stripe | null;
  private cardElement!: StripeCardElement;
  
  cardElementRef = viewChild('cardElement');
  
  cardReadyEvent = output<void>();
  cardCompleteEvent = output<void>();
  cardErrorEvent = output<string | null>();
  
  cardErrorMessage = signal<string | null>(null);

  constructor() { }

  get stripe(): Stripe | null {
    return this.stripeInstance;
  }

  get card(): StripeCardElement | null {
    return this.cardElement;
  }

  async ngAfterViewInit() {
    this.stripeInstance = await loadStripe(
      environment.stripe.publishableKey, {
        locale: 'es'
      }
    );

    if (!this.stripeInstance) throw new Error('Stripe not loaded');
    
    if (this.cardElementRef()) {
      this.cardElement = this.stripeInstance.elements().create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#E5E5E5',
            iconColor: '#cacaca',
            fontFamily: '"Nunito Sans", Helvetica, sans-serif',
            '::placeholder': {
              color: '#7d7d7d'
            }
          },
          complete: {
            iconColor: '#2DD55B'
          },
          invalid: {
            color: '#EB4447',
            iconColor: '#EB4447'
          }
        }
      })
      this.cardElement.mount('#cardElement');

      this.cardElement.on('change', (event) => {
        if (event.complete) {
          this.cardErrorMessage.set(null);
          this.cardCompleteEvent.emit();
        }
        if (event.error?.message) {
          this.cardErrorMessage.set(event.error?.message ?? null);
          this.cardErrorEvent.emit(event.error?.message);
        } else {
          this.cardErrorMessage.set(null);
        }
      })

      this.cardReadyEvent.emit();
    }
    
    const cardElementDom = this.cardElementRef();
    if (cardElementDom) {
    }
  }

}
