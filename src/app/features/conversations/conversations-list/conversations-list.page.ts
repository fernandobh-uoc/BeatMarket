import { Component, computed, inject, linkedSignal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ConversationsListService } from './data-access/conversations-list.service';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { ConversationModel } from 'src/app/core/domain/models/conversation.model';

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ConversationsListPage {
  private route = inject(ActivatedRoute);
  private conversationsListService = inject(ConversationsListService);

  conversationsAsSeller = computed(() => {
    const source = this.conversationsListService.conversationsListState().conversationsAsSeller;
    return source.length > 0 ? source : this.route.snapshot.data['conversationsAsSeller'];
  });

  conversationsAsBuyer = computed(() => {
    const source = this.conversationsListService.conversationsListState().conversationsAsBuyer;
    return source.length > 0 ? source : this.route.snapshot.data['conversationsAsBuyer'];
  });

  conversations = computed(() => ({
    asBuyer: this.conversationsAsBuyer(),
    asSeller: this.conversationsAsSeller()
  }));

  loading = computed(() => this.conversationsListService.conversationsListState().loading);
  errorMessage = computed(() => this.conversationsListService.conversationsListState().errorMessage);

  constructor() { }
}
