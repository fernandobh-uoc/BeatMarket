import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonButton } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { CartItemsListComponent } from './ui/cart-items-list/cart-items-list.component';
import { CartService } from './data-access/cart.service';
import { CartItemModel } from 'src/app/core/domain/models/cart.model';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [RouterLink, IonButton, IonText, CartItemsListComponent, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class CartPage {
  private cartService = inject(CartService);

  cartItems = computed<CartItemModel[]>(() => this.cartService.cartState().cartItems ?? []);

  itemsArticlesTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));
  itemsShippingTotal = computed<number>(() => this.cartItems().reduce((acc, item) => acc + item.shipping, 0));
  totalPrice = computed<number>(() => this.itemsArticlesTotal() + this.itemsShippingTotal());
}
