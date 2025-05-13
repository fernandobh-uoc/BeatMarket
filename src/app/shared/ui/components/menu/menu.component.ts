import { Component, inject, input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonMenu, IonMenuToggle, IonHeader, IonTitle, IonToolbar, IonContent, IonButtons, IonAvatar, IonList, IonItem, IonLabel, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { time, settings, logOut } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonIcon, IonLabel, IonItem, IonList, RouterLink, IonMenuToggle, IonAvatar, IonButtons, IonContent, IonToolbar, IonTitle, IonMenu, IonHeader]
})
export class MenuComponent  implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);

  contentId = input<string>('');
  username = input<string>('');
  userProfilePictureURL = input<string>('');
  
  constructor() {
    addIcons({ time, settings, logOut });
  }

  async goToHistory() {
    try {
      this.router.navigate(['/tabs/history']);
    } catch (error) {
      console.error(error);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/landing']);
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {}
}
