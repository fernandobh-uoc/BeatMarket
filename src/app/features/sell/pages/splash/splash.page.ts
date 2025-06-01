import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { SellService } from '../../data-access/sell.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, CommonModule, FormsModule]
})
export class SplashPage implements OnInit {
  sellService = inject(SellService);
  router = inject(Router);
  
  postId = computed(() => this.sellService.sellState().latestPublishedPostId);

  constructor() { }

  goToPostDetail() {
    this.router.navigateByUrl(`/tabs/post-detail/${this.postId()}`, { replaceUrl: true });
  }

  ngOnInit() {
  }

}
