import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonAvatar, IonItem, IonLabel, IonThumbnail, IonIcon } from '@ionic/angular/standalone';
import { User } from 'src/app/core/domain/models/user.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
  standalone: true,
  imports: [IonIcon, RouterLink, IonLabel, IonItem, IonThumbnail, IonAvatar, ToolbarComponent, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);

  userData = signal<User | null>(null);

  constructor() {
    addIcons({ locationOutline });
  }

  ngOnInit() {
    const userData$ = this.route.snapshot.data['userData$'];
    if (userData$) {
      userData$.subscribe((userData: User | null) => {
        this.userData.set(userData);
      });
    }
  }

}
