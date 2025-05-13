import { Component, input, OnInit } from '@angular/core';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { IonText, IonList, IonItem, IonLabel, IonThumbnail, IonAvatar } from "@ionic/angular/standalone";
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  imports: [DatePipe, IonAvatar, IonLabel, IonItem, IonList, IonText, IonThumbnail, FormatCurrencyPipe]
})
export class HistoryListComponent  implements OnInit {
  sales = input<Sale[] | null>(null);
  type = input<'bought' | 'sold'>('bought');

  constructor() { }

  ngOnInit() {}

}
