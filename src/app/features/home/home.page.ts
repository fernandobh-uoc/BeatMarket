import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonText, IonSpinner } from '@ionic/angular/standalone';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { Role } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PostCardsRowComponent } from './ui/post-cards-row/post-cards-row.component';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { HomeService } from './data-access/home.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { firstValueFrom, map } from 'rxjs';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, PostCardsRowComponent, ToolbarComponent, IonHeader, IonContent]
})
export class HomePage implements ViewDidEnter, ViewDidLeave {
  route = inject(ActivatedRoute);
  homeService = inject(HomeService);

  latestPosts = computed(() => this.homeService.homeState().latestPosts);
  recommendedPosts = computed(() => this.homeService.homeState().recommendedPosts);

  loading = computed(() => this.homeService.homeState().loading);
  errorMessage = computed(() => this.homeService.homeState().errorMessage);
  
  toolbar = viewChild(ToolbarComponent);
  
  constructor() {}

  ionViewDidEnter(): void {
   this.homeService.reloadResources();
  }

  ionViewDidLeave(): void {
    this.toolbar()?.searchActive.set(false);
  }
}
