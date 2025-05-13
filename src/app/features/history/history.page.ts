import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { HistoryListComponent } from './ui/history-list/history-list.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [HistoryListComponent, IonText, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HistoryPage implements OnInit {
  private route = inject(ActivatedRoute);

  boughtItems = signal<Sale[] | null>(null);
  soldItems = signal<Sale[] | null>(null);

  selectedTab = signal<string>('boughtItems')

  constructor() {
    effect(() => {
      console.log({
        boughtItems: this.boughtItems(),
        soldItems: this.soldItems()
      })
    })
  }

  ngOnInit() {
    this.boughtItems.set(this.route.snapshot.data['boughtItems']);
    this.soldItems.set(this.route.snapshot.data['soldItems']);
  }

}
