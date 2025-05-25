import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonSpinner } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { HistoryListComponent } from './ui/history-list/history-list.component';
import { HistoryService } from './data-access/history.service';
import { ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonSpinner, HistoryListComponent, IonText, ToolbarComponent, IonContent, IonHeader, CommonModule, FormsModule]
})
export class HistoryPage {
  private historyService = inject(HistoryService);

  boughtItems = linkedSignal<Sale[]>(() => this.historyService.historyState().boughtItems);
  soldItems = linkedSignal<Sale[]>(() => this.historyService.historyState().soldItems);

  loading = computed(() => this.historyService.historyState().loading);
  errorMessage = computed(() => this.historyService.historyState().errorMessage);

  selectedTab = signal<'boughtItems' | 'soldItems'>('boughtItems')

  constructor() {}
}
