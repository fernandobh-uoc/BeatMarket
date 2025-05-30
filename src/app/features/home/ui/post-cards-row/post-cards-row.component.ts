import { Component, computed, input, OnInit } from '@angular/core';
import { PostModel } from 'src/app/core/domain/models/post.model';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/angular/standalone";
import { FormatCurrencyPipe } from "../../../../shared/utils/pipes/format-currency.pipe";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-cards-row',
  templateUrl: './post-cards-row.component.html',
  styleUrls: ['./post-cards-row.component.scss'],
  imports: [RouterLink, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, FormatCurrencyPipe]
})
export class PostCardsRowComponent implements OnInit {
  posts = input<Partial<PostModel>[]>([]);

  constructor() { }

  ngOnInit() {}

}
