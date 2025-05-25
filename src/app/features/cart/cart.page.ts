import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { CartItemsListComponent } from './ui/cart-items-list/cart-items-list.component';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { CartService } from './data-access/cart.service';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, RouterLink, IonButton, IonText, CartItemsListComponent, ToolbarComponent, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class CartPage {
  private cartService = inject(CartService);

  cartItems = computed<CartItemModel[]>(() => this.cartService.cartState().cartItems ?? []);
  loading = computed<boolean>(() => this.cartService.cartState().loading);

  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());
}
