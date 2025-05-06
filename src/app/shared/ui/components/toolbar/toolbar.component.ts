import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonMenuToggle, IonIcon, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonProgressBar, IonSearchbar, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cartOutline, menu, searchOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { CartService } from 'src/app/features/cart/data-access/cart.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [MenuComponent, IonMenuToggle, IonBadge, IonSearchbar, IonProgressBar, IonBackButton, IonButton, IonIcon, IonButtons, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ToolbarComponent implements OnInit {
  public cartService = inject(CartService);
  public router = inject(Router);
  
  public type = input<'arrow-back' | 'menu'>('arrow-back');

  public largeTitle = input<boolean>(false);
  public title = input<string>('');

  public searchActive = signal<boolean>(false);

  public showSearch = input<boolean>(true);
  public showCart = input<boolean>(true);

  public showProgressBar = input<boolean>(false);
  public progressBarValue = input<number>(0);

  constructor() {
    addIcons({ menu, arrowBackOutline, searchOutline, cartOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.cartService.loadCart();
    
  }

  openMenu() {
    console.log('open menu');
  }

  openSearchBar() {
    this.searchActive.set(true);
  }
}
