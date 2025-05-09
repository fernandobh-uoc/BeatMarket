import { Component, inject, input, OnInit } from '@angular/core';
import { IonList, IonItem, IonThumbnail, IonLabel, IonText } from "@ionic/angular/standalone";
import { ActivePost } from 'src/app/core/domain/models/user.model';
import { FormatCurrencyPipe } from 'src/app/shared/utils/pipes/format-currency.pipe'; 

@Component({
  selector: 'app-user-posts-list',
  templateUrl: './user-posts-list.component.html',
  styleUrls: ['./user-posts-list.component.scss'],
  imports: [FormatCurrencyPipe, IonText, IonLabel, IonItem, IonList, IonThumbnail]
})
export class UserPostsListComponent  implements OnInit {
  posts = input<ActivePost[] | undefined | null>(null);

  constructor() { }

  ngOnInit() {}

}
