import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { RegisterService } from '../register/data-access/register.service';
import { users } from 'src/app/shared/utils/user.seeder';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, CommonModule, RouterLink, FormsModule]
})
export class LandingPage {
  /* registerService = inject(RegisterService);

  createUsers = async () => {
    try {
      for (const user of users) {
        await this.registerService.registerUser(user);
      }
    } catch (error) {
      console.error(error);
    }
  } */
}
