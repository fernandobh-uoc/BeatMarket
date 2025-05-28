import { Component, inject, input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CartItemComponent } from './cart-item.component';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { CartService } from '../../data-access/cart.service';

@Component({
  selector: 'app-cart-item-wrapper',
  template: `
    <app-cart-item
      [item]="item()"
      (removeItem)="onRemoveItem($event)"
    ></app-cart-item>
  `,
  styles: `
    .alert .alert-wrapper {
      --background: red;
      box-shadow: none;
    }

    .cancel-button {
      color: var(--ion-color-light);
    }

    .delete-button {
      color: var(--ion-color-danger);
    }
  `,
  imports: [CartItemComponent]
})
export class CartItemWrapperComponent {
  private cartService = inject(CartService);
  private alertController = inject(AlertController);

  item = input<CartItemModel>();

  constructor() { }

  async onRemoveItem(event: MouseEvent) {
    event.stopPropagation(); // Prevents navigation to post detail

    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Estás a punto de eliminar el artículo de tu carrito',
      cssClass: 'alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Eliminar',
          cssClass: 'delete-button',
          handler: () => {
            this.cartService.removeItemFromCart(this.item()?.postId || '');
          }
        }
      ]
    });

    await alert.present();
  }
}
