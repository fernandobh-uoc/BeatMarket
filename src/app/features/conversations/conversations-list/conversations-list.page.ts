import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ConversationsListService } from './data-access/conversations-list.service';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { ConversationsListComponent } from './ui/conversations-list/conversations-list.component';

@Component({
  selector: 'app-conversations-list-page',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
  standalone: true,
  imports: [ToolbarComponent, ConversationsListComponent, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ConversationsListPage {
  private route = inject(ActivatedRoute);
  private conversationsListService = inject(ConversationsListService);

  selectedTab = signal<'conversationsAsBuyer' | 'conversationsAsSeller'>('conversationsAsBuyer');
  
  conversationsAsBuyer = computed(() => {
    const source = this.conversationsListService.conversationsListState().conversationsAsBuyer;
    return source.length > 0 ? source : this.route.snapshot.data['conversationsAsBuyer'];
  });

  conversationsAsSeller = computed(() => {
    const source = this.conversationsListService.conversationsListState().conversationsAsSeller;
    return source.length > 0 ? source : this.route.snapshot.data['conversationsAsSeller'];
  });

  conversations = computed(() => ({
    asBuyer: this.conversationsAsBuyer(),
    asSeller: this.conversationsAsSeller()
  }));

  loading = computed(() => this.conversationsListService.conversationsListState().loading);
  errorMessage = computed(() => this.conversationsListService.conversationsListState().errorMessage);

  constructor() { }
}
