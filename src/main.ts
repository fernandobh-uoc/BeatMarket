import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, indexedDBLocalPersistence, initializeAuth, AuthModule } from '@angular/fire/auth';
import { provideFirestore, getFirestore, initializeFirestore, persistentLocalCache } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment.dev';
import { importProvidersFrom } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './app/core/services/auth/auth.service';
import { PostRepository } from './app/core/domain/repositories/post.repository';
import { FirestorePostRepository } from './app/core/storage/adapters/firestore/repositories/firestore.post.repository';
import { CartRepository } from './app/core/domain/repositories/cart.repository';
import { FirestoreCartRepository } from './app/core/storage/adapters/firestore/repositories/firestore.cart.repository';
import { UserRepository } from './app/core/domain/repositories/user.repository';
import { FirestoreUserRepository } from './app/core/storage/adapters/firestore/repositories/firestore.user.repository';
import { SaleRepository } from './app/core/domain/repositories/sale.repository';
import { FirestoreSaleRepository } from './app/core/storage/adapters/firestore/repositories/firestore.sale.repository';
import { ConversationRepository } from './app/core/domain/repositories/conversation.repository';
import { FirestoreConversationRepository } from './app/core/storage/adapters/firestore/repositories/firestore.conversation.repository';
import { FirebaseAuthAdapter } from './app/core/services/auth/adapters/firebase-auth.adapter';
import { Auth } from './app/core/services/auth/auth.interface';
import { FirebaseCloudStorageAdapter } from './app/core/services/cloud-storage/adapters/firebase-cloudStorage.adapter';
import { CloudStorage } from './app/core/services/cloud-storage/cloudStorage.interface';
import { PushNotificationsService } from './app/core/services/push-notifications/push-notifications.service';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase);
      if (Capacitor.isNativePlatform()) {
        initializeFirestore(app, {
          localCache: persistentLocalCache()
        });
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence
        })
      }
      return app;
    }),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    importProvidersFrom(IonicStorageModule.forRoot()),

    { provide: Auth, useClass: FirebaseAuthAdapter },
    { provide: UserRepository, useClass: FirestoreUserRepository },
    { provide: PostRepository, useClass: FirestorePostRepository },
    { provide: CartRepository, useClass: FirestoreCartRepository },
    { provide: SaleRepository, useClass: FirestoreSaleRepository },
    { provide: ConversationRepository, useClass: FirestoreConversationRepository },
    { provide: CloudStorage, useClass: FirebaseCloudStorageAdapter },

    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      const pushNotificationsService = inject(PushNotificationsService);

      await authService.init();
      pushNotificationsService.initPushNotifications();
    }),
  ],
});
