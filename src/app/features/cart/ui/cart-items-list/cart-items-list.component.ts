import { Component, effect, input, OnInit } from '@angular/core';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { CartItemWrapperComponent } from '../cart-item/cart-item-wrapper/cart-item-wrapper.component';

@Component({
  selector: 'app-cart-items-list',
  templateUrl: './cart-items-list.component.html',
  styleUrls: ['./cart-items-list.component.scss'],
  imports: [CartItemWrapperComponent]
})
export class CartItemsListComponent  implements OnInit {
  items = input<CartItemModel[]>([]);

  constructor() {
    effect(() => console.log(this.items()));
  }

  ngOnInit() {}

}
