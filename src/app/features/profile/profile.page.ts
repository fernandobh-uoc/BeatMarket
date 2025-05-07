import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonLabel } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonLabel, IonText, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  authService = inject(AuthService);

  currentUser = computed(() => this.authService.currentUser());
  
  constructor() {}

  selectedTab = signal<string>('profileData');

  ngOnInit() {
  }

}
