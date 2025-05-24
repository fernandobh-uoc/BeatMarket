import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonText, IonAvatar, IonItem, IonLabel, IonThumbnail, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { User } from 'src/app/core/domain/models/user.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
import { UserDetailService } from './data-access/user-detail.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
  imports: [IonSpinner, IonIcon, RouterLink, IonLabel, IonItem, IonThumbnail, IonAvatar, ToolbarComponent, IonText, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private userDetailService = inject(UserDetailService);

  userData = computed(() => this.userDetailService.userDetailState().userData);

  loading = computed(() => this.userDetailService.userDetailState().loading);
  errorMessage = computed(() => this.userDetailService.userDetailState().errorMessage);

  constructor() {
    addIcons({ locationOutline });
  }

  ngOnInit() {
    this.userDetailService.setUserId(this.route.snapshot.paramMap.get('userId') ?? '');
  }

}
