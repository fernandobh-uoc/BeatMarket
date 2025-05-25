import { Component, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonThumbnail, IonText, IonInput, IonIcon, IonAvatar, IonFooter } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConversationService } from './data-access/conversation.service';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormatCurrencyPipe } from "../../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { navigateOutline } from 'ionicons/icons';
import { Conversation, MessageModel } from 'src/app/core/domain/models/conversation.model';
import { FormatTimestampPipe } from '../conversation/utils/pipes/format-timestamp.pipe';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
  standalone: true,
  imports: [FormatTimestampPipe, IonFooter, IonAvatar, RouterLink, IonIcon, IonInput, IonText, ToolbarComponent, IonThumbnail, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class ConversationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private conversationService = inject(ConversationService);
  private authService = inject(AuthService);

  conversation = computed<Conversation | null>(() => this.conversationService.conversationState().conversation);
  conversationMessages = computed<(MessageModel & { type: 'sent' | 'received' })[]>(() => { 
    return this.conversation()?.messages
      .slice()
      .reverse()
      .map((message) => ({
        ...message,
        type: message.senderId === this.authService.authState().userId ? 'sent' : 'received'
      })) ?? []
  }); 
  role = computed(() => this.conversationService.conversationState().role);
  loading = computed(() => this.conversationService.conversationState().loading);
  errorMessage = computed(() => this.conversationService.conversationState().errorMessage);

  inputMessage = signal<string>('');

  displayedUserData = computed<{ username: string, profilePictureURL: string }>(() => ({
    username: this.conversation()?.participants[this.role() === 'buyer' ? 'seller' : 'buyer'].username ?? '',
    profilePictureURL: this.conversation()?.participants[this.role() === 'buyer' ? 'seller' : 'buyer'].profilePictureURL ?? '',
  }));

  scrollContainer = viewChild<IonContent>('scrollContainer');

  constructor() { 
    addIcons({ navigateOutline });
    effect(async () => {
      this.conversationMessages();
      setTimeout(() => this.scrollToBottom(), 10);
    })
  }

  async ngOnInit() {
    this.conversationService.setConversationId(this.route.snapshot.paramMap.get('conversationId') ?? '');
  }

  async sendMessage() {
    if (!this.inputMessage()) return;
    await this.conversationService.sendMessage(this.inputMessage());
    this.inputMessage.set('');
  }

  async scrollToBottom() {
    await this.scrollContainer()?.scrollToBottom();
  }

}
