import { Component, inject, OnInit, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonText } from '@ionic/angular/standalone';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { Role } from 'src/app/core/domain/models/user.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PostCardsRowComponent } from './ui/post-cards-row/post-cards-row.component';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { HomeService } from './data-access/home.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonText, PostCardsRowComponent, ToolbarComponent, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class HomePage implements OnInit {
  route = inject(ActivatedRoute);
  homeService = inject(HomeService);

  #latestPosts = signal<Post[]>([]);
  #recommendedPosts = signal<Post[]>([]);

  get latestPosts() {
    return this.#latestPosts();
  }

  get recommendedPosts() {
    return this.#recommendedPosts();
  }

  async ngOnInit(): Promise<void> {
    //this.#latestPosts.set(await firstValueFrom(this.route.data.pipe(map(data => data['latestPosts']))));
    //this.#recommendedPosts.set(await firstValueFrom(this.route.data.pipe(map(data => data['recommendedPosts']))));
    this.#latestPosts.set(await this.route.snapshot.data['latestPosts']);
    this.#recommendedPosts.set(await this.route.snapshot.data['recommendedPosts']);


    console.log({ latestPosts: this.#latestPosts(), recommendedPosts: this.#recommendedPosts() });
  }
}
