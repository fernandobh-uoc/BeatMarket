import { Component, computed, effect, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonMenuToggle, IonIcon, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonProgressBar, IonSearchbar, IonBadge, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cartOutline, menu, searchOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { CartService } from 'src/app/features/cart/data-access/cart.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonAvatar, IonMenuToggle, IonBadge, IonSearchbar, IonProgressBar, IonBackButton, IonButton, IonIcon, IonButtons, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ToolbarComponent implements OnInit {
  public cartService = inject(CartService);
  public router = inject(Router);
  
  public type = input<'arrow-back' | 'menu'>('arrow-back');
  //public backActionCallback = input<(() => void) | null>(null);

  // Default uses the default Ion Back Button, emit just emits the event
  public backActionType = input<'emit' | 'default'>('default');
  public backPressed = output<void>();

  public largeTitle = input<boolean>(false);
  public title = input<string>('');

  public showSearch = input<boolean>(true);
  public searchDefaultActive = input<boolean>(false);
  public searchDefaultValue = input<string>('');
  public searchQuery = signal<string | null>('');
  public searchActive = signal<boolean>(this.searchDefaultActive());

  public showCart = input<boolean>(true);
  public cartItemsAmount = computed<number>(() => this.cartService.cartState()?.cartItemsAmount ?? 0);

  public showProgressBar = input<boolean>(false);
  public progressBarValue = input<number>(0);
  
  public showAvatar = input<boolean>(false);
  public avatarUrl = input<string>('');

  constructor() {
    addIcons({ menu, arrowBackOutline, searchOutline, cartOutline });
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
