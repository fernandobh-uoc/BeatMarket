import { Component, input, OnInit, output } from '@angular/core';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { IonText, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { trashBinOutline, trashOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  imports: [RouterLink, IonIcon, IonText, FormatCurrencyPipe],
})
export class CartItemComponent  implements OnInit {
  item = input<CartItemModel>();
  removeItem = output<MouseEvent>(); 

  constructor() { 
    addIcons({ trashBinOutline, trashOutline });
  }

  ngOnInit() {}

}
