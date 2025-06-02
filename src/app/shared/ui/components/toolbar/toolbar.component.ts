import { Component, computed, effect, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonMenuToggle, IonIcon, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonProgressBar, IonSearchbar, IonBadge, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, arrowBackOutline, arrowBackSharp, cartOutline, menu, searchOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { CartService } from 'src/app/features/cart/data-access/cart.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonAvatar, IonMenuToggle, IonBadge, IonSearchbar, IonProgressBar, IonBackButton, IonButton, IonIcon, IonButtons, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ToolbarComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private platform = inject(Platform);

  mode: 'md' | 'ios';
  
  type = input<'arrow-back' | 'menu'>('arrow-back');

  // Default uses the default Ion Back Button, emit just emits the event
  backActionType = input<'emit' | 'default'>('default');
  backPressed = output<void>();

  largeTitle = input<boolean>(false);
  title = input<string>('');
  titleFontSize = input<'large' | 'medium' | 'small'>('large');

  showSearch = input<boolean>(true);
  searchDefaultActive = input<boolean>(false);
  searchDefaultValue = input<string>('');
  searchQuery = signal<string | null>('');
  searchActive = signal<boolean>(this.searchDefaultActive());

  showCart = input<boolean>(true);
  cartItemsAmount = computed<number>(() => this.cartService.cartState()?.cartItemsAmount ?? 0);

  showProgressBar = input<boolean>(false);
  progressBarValue = input<number>(0);
  
  showAvatar = input<boolean>(false);
  avatarUrl = input<string>('');

  constructor() {
    addIcons({ menu, arrowBack, arrowBackOutline, arrowBackSharp, searchOutline, cartOutline });
    this.mode = this.platform.is('ios') ? 'ios' : 'md';
  }

  ngOnInit() {
    this.searchActive.set(this.searchDefaultActive());
  }

  openSearchBar() {
    this.searchActive.set(true);
  }

  closeSearchBar() {
    this.searchActive.set(false);
  }

  goToCart() {
    this.router.navigate(['/cart'])
  }

  submitSearch() {
    if (this.searchQuery()?.trim()) {
      this.router.navigate(['/tabs/search'], {
        queryParams: {
          query: this.searchQuery()?.trim()
        }
      })
    }
  }
}
