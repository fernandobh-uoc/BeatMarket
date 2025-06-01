import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonTabs, IonTabButton, IonTabBar, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatboxEllipses, home, musicalNotes, personCircle } from 'ionicons/icons';
import { MenuComponent } from '../components/menu/menu.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [MenuComponent, IonLabel, IonTabBar, IonTabButton, IonTabs, IonIcon, CommonModule, FormsModule]
})
export class TabsPage {
  router = inject(Router);
  authService = inject(AuthService);

  constructor() {
    addIcons({ home, personCircle, musicalNotes, chatboxEllipses });
  }

  onTabChange(event: { tab: string }) {
    if (event.tab === 'sell') {
      this.router.navigateByUrl('/tabs/sell/publish', { replaceUrl: true });
    }
  }
}
