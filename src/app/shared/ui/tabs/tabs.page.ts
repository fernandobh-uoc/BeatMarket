import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonTabs, IonTabButton, IonTabBar, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatboxEllipses, home, musicalNotes, personCircle } from 'ionicons/icons';
import { MenuComponent } from '../components/menu/menu.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [MenuComponent, IonLabel, IonTabBar, IonTabButton, IonTabs, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TabsPage {
  authService = inject(AuthService);

  constructor() {
    addIcons({ home, personCircle, musicalNotes, chatboxEllipses });
  }
}
