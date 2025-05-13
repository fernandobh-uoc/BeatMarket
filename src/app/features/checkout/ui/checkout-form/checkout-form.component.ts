import { Component, inject, input, OnInit, output } from '@angular/core'; 
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonLabel, IonInput, IonText, IonButton } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-checkout-form',
  templateUrl: './checkout-form.component.html',
  styleUrls: ['./checkout-form.component.scss'],
  imports: [IonButton, IonText, IonInput, IonLabel, ReactiveFormsModule]
})
export class CheckoutFormComponent  implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  checkoutForm!: FormGroup;

  userFullName = input<string>('');

  formSubmit = output<void>();
  submitAttempted = input<boolean>(false);
  controlFocus = output<string>();

  constructor() { }

  ngOnInit() {
    this.#initForm();
  }

  #initForm() {
    this.checkoutForm = this.fb.group({
      cardName: this.fb.control(this.userFullName(), {
        validators: [Validators.required],
        updateOn: 'blur'
      }),
      cardNumber: this.fb.control('', {
        validators: [Validators.required, Validators.pattern(/^\d{4} - \d{4} - \d{4} - \d{4}$/)],
        updateOn: 'blur'
      }),
      expirationMonth: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
        updateOn: 'blur'
      }),
      expirationYear: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
        updateOn: 'blur'
      }),
      cvc: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
        updateOn: 'blur'
      })
    })
  }

  onCardNumberInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const parts = value.match(/.{1,4}/g);
    input.value = parts ? parts.join(' - ') : value;

    this.checkoutForm.get('cardNumber')?.setValue(input.value, { emitEvent: false });
  }

}
