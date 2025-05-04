import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonProgressBar, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cartOutline, menu, searchOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonSearchbar, IonProgressBar, IonBackButton, IonButton, IonIcon, IonButtons, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ToolbarComponent {
  router = inject(Router);
  
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

  openMenu() {
    console.log('open menu');
  }

  openSearchBar() {
    this.searchActive.set(true);
  }
}
