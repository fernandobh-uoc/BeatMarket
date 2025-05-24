import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-reset-email-sent',
  templateUrl: './password-reset-email-sent.page.html',
  styleUrls: ['./password-reset-email-sent.page.scss'],
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, CommonModule, FormsModule]
})
export class PasswordResetEmailSentPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
