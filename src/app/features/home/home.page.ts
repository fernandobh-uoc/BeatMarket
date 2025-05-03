import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { Role } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  #userRepository = inject(UserRepository);
  #authService = inject(AuthService);
  #router = inject(Router);
 
  logout = async () => {
    try {
      await this.#authService.logout();
    } catch (error) {
      console.error(error);
    }

    this.#router.navigate(['/auth/landing']);
  }
}
