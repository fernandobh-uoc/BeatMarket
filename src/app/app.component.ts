import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  platform = inject(Platform);
  router = inject(Router);

  constructor() {
    this.platform.ready().then(() => {
      App.addListener('appUrlOpen', (data) => {
        const url = new URL(data.url);
        if (url.pathname === '/stripe-onboarding-complete') {
          this.router.navigateByUrl('/tabs/sell/publish');
        } 

        if (url.pathname === '/stripe-onboarding-canceled') {
          this.router.navigateByUrl('/tabs/sell/stripe-setup');
        }
      })
    })
  }
}
