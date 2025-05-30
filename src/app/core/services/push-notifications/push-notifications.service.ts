import { inject, Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../storage/local-storage.service';
import { ConversationService } from 'src/app/features/conversations/conversation/data-access/conversation.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  private authService = inject(AuthService);
  private conversationService = inject(ConversationService);
  private userRepository = inject(UserRepository);
  private cache = inject(LocalStorageService);
  private router = inject(Router);

  constructor() { }

  initPushNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(async (result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        console.log('Push notifications permissions granted!');
        PushNotifications.register();
      } else {
        console.warn(`Error in permissions request: ${result}`); 
        /* if (await this.cache.get<string>('fcmToken')) {
          await this.cache.remove('fcmToken');
        } */
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      async (token: Token) => {
        const storedToken = await this.cache.get<string>('fcmToken');

        if (storedToken !== token.value) {
          console.log(`Push registration success, token: ${token.value}`);
          this.cache.set('fcmToken', token.value);

          const user = this.authService.currentUser();
          if (user) {
            await this.userRepository.updateUser({ 
              _id: user._id, 
              fcmToken: token.value 
            });
          }
        }
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.error('Error on push notifications registration: ' + JSON.stringify(error));
      }
    );

    // Show the notification payload if the app is open on the device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(action));

        const type: string = action.notification.data?.type;

        switch (type) {
          case 'sale':
            const postId = action.notification.data?.postId;
            if (postId) {
              this.router.navigate([`/tabs/post-detail/${postId}`]);
            }
            break;
          case 'message':
            const conversationId = action.notification.data?.conversationId;
            if (conversationId) {
              this.conversationService.setConversationId(conversationId);
              this.conversationService.reloadConversationResource();
              this.router.navigate([`/conversation/${conversationId}`]);
            }
            break;
          default: 
            console.warn(`Unhandled push notification type: ${type}`);
            break;
        }
      }
    );
  }
}
