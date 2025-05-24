import { Component, input, OnInit } from '@angular/core';
import { Conversation, ConversationModel } from 'src/app/core/domain/models/conversation.model';
import { IonText, IonList, IonAvatar, IonLabel } from "@ionic/angular/standalone";
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.scss'],
  imports: [RouterLink, DatePipe, IonAvatar, IonList, IonText]
})
export class ConversationsListComponent  implements OnInit {
  conversations = input<ConversationModel[]>([]);
  type = input<'asBuyer' | 'asSeller'>('asBuyer');  

  constructor() { }

  ngOnInit() {}

}
