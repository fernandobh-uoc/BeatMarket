import { Component, inject, input, OnInit } from '@angular/core';
import { CartItemComponent } from '../cart-item.component';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { CartService } from '../../../data-access/cart.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cart-item-wrapper',
  template: `
    <app-cart-item
      [item]="item()"
      (removeItem)="onRemoveItem($event)"
    ></app-cart-item>
  `,
  styles: `
    .cancel-button {
      color: var(--ion-color-light);
    }

    .delete-button {
      color: var(--ion-color-danger);
    }
  `,
  imports: [CartItemComponent]
})
export class CartItemWrapperComponent implements OnInit {
  private cartService = inject(CartService);
  private alertController = inject(AlertController);

  item = input<CartItemModel>();

  constructor() { }

  ngOnInit() {}

  async onRemoveItem(event: MouseEvent) {
    event.stopPropagation(); // Prevents navigation to post detail

    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Estás a punto de eliminar el artículo de tu carrito',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Eliminar',
          cssClass: 'delete-button',
          handler: () => {
            console.log('Delete clicked');
            this.cartService.removeItemFromCart(this.item()?.postId || '');
          }
        }
      ]
    });

    await alert.present();
  }
}
