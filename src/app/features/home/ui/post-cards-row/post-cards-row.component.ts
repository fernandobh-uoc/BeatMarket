import { Component, input, OnInit } from '@angular/core';
import { PostModel } from 'src/app/core/domain/models/post.model';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-post-cards-row',
  templateUrl: './post-cards-row.component.html',
  styleUrls: ['./post-cards-row.component.scss'],
  imports: [IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard]
})
export class PostCardsRowComponent implements OnInit {
  posts = input<Partial<PostModel>[]>([]);

  constructor() { }

  ngOnInit() {}

}
