import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ConversationService } from './data-access/conversation.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ConversationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private conversationService = inject(ConversationService);

  conversation = computed(() => this.conversationService.conversationState().conversation);
  loading = computed(() => this.conversationService.conversationState().loading);
  errorMessage = computed(() => this.conversationService.conversationState().errorMessage);

  constructor() { 
    effect(() => console.log(this.conversationService.conversationState()));
  }

  async ngOnInit() {
    this.conversationService.setConversationId(this.route.snapshot.paramMap.get('conversationId') ?? '');
    /* await this.conversationService.loadConversationId({ 
      productId: this.route.snapshot.queryParamMap.get('postId') ?? '',
      sellerId: this.route.snapshot.queryParamMap.get('postUserId') ?? ''
    }); */

    
  }

}
