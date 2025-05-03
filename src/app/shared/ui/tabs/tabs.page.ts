import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonTabs, IonTabButton, IonTabBar, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatboxEllipses, home, musicalNotes, personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonLabel, IonTabBar, IonTabButton, IonTabs, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TabsPage {
  constructor() {
    addIcons({ home, personCircle, musicalNotes, chatboxEllipses });
  }
}
