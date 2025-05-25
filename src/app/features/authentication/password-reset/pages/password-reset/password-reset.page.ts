import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PasswordResetFormComponent } from '../../ui/password-reset-form/password-reset-form.component';
import { PasswordResetService } from '../../data-access/password-reset.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  standalone: true,
  imports: [PasswordResetFormComponent, ToolbarComponent, IonContent, IonHeader, CommonModule, FormsModule]
})
export class PasswordResetPage {
  private passwordResetService = inject(PasswordResetService);

  constructor() { }

  resetPassword(email: string) {
    this.passwordResetService.resetPassword(email);
  }

}
