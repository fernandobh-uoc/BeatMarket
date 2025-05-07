import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { SellService } from '../../data-access/sell.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SplashPage implements OnInit {
  sellService = inject(SellService);
  
  postId = computed(() => this.sellService.latestPublishedPostId());

  constructor() { }

  ngOnInit() {
  }

}
