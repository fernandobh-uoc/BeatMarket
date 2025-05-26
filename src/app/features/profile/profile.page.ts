import { Component, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonLabel } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserDataListComponent } from './ui/user-data-list/user-data-list.component';
import { ProfileService } from './data-access/profile.service';
import { ViewDidLeave } from '@ionic/angular';
import { UserPostsListComponent } from './ui/user-posts-list/user-posts-list.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [UserDataListComponent, UserPostsListComponent, IonText, ToolbarComponent, IonContent, IonHeader, CommonModule, FormsModule],
  providers: [ProfileService]
})
export class ProfilePage implements OnInit, ViewDidLeave {
  authService = inject(AuthService);
  profileService = inject(ProfileService);

  selectedTab = signal<string>('profileData');

  currentUser = computed(() => this.authService.currentUser());

  toolbar = viewChild(ToolbarComponent);

  constructor() {}

  ionViewDidLeave(): void {
    this.profileService.resetEditingInputStates();
    this.toolbar()?.searchActive.set(false);
  }

  ngOnInit() {}

}
