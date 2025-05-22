import { Component, input, OnInit } from '@angular/core';
import { Sale, SaleModel } from 'src/app/core/domain/models/sale.model';
import { IonText, IonList, IonLabel, IonThumbnail, IonAvatar } from "@ionic/angular/standalone";
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  imports: [RouterLink, DatePipe, IonAvatar, IonLabel, IonList, IonText, IonThumbnail, FormatCurrencyPipe]
})
export class HistoryListComponent  implements OnInit {
  sales = input<SaleModel[] | null>(null);
  type = input<'bought' | 'sold'>('bought');

  constructor() { }

  ngOnInit() {}

}
