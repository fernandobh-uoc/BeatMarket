import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonText, IonSpinner } from '@ionic/angular/standalone';
import { ConversationsListService } from './data-access/conversations-list.service';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { ConversationsListComponent } from './ui/conversations-list/conversations-list.component';
import { Conversation } from 'src/app/core/domain/models/conversation.model';

@Component({
  selector: 'app-conversations-list-page',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
  standalone: true,
  imports: [IonSpinner, ToolbarComponent, ConversationsListComponent, IonText, IonContent, IonHeader, CommonModule, FormsModule]
})
export class ConversationsListPage {
  private conversationsListService = inject(ConversationsListService);

  selectedTab = signal<'conversationsAsBuyer' | 'conversationsAsSeller'>('conversationsAsBuyer');

  conversationsAsBuyer = computed(() => 
    this.conversationsListService.conversationsListState().conversationsAsBuyer
      .filter((conversation: Conversation) => conversation.messages.length > 0)
  );
  conversationsAsSeller = computed(() => 
    this.conversationsListService.conversationsListState().conversationsAsSeller
      .filter((conversation: Conversation) => conversation.messages.length > 0)
  );

  conversations = computed(() => ({
    asBuyer: this.conversationsAsBuyer(),
    asSeller: this.conversationsAsSeller()
  }));

  loading = computed(() => this.conversationsListService.conversationsListState().loading);
  errorMessage = computed(() => this.conversationsListService.conversationsListState().errorMessage);

  constructor() { }
}
