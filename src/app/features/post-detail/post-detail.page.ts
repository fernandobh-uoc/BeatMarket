import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonAvatar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Post, PostStatus } from 'src/app/core/domain/models/post.model';
import { PostDetailService } from './data-access/post-detail.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PostImagesSliderComponent } from './ui/post-images-slider/post-images-slider.component';
import { addIcons } from 'ionicons';
import { chatbubbleEllipses, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { Observable } from 'rxjs';
import { KeyValuePairsPipe } from 'src/app/shared/utils/pipes/key-value-pairs.pipe';
import { ArticleCharacteristicsTranslatePipe } from 'src/app/shared/utils/pipes/article-characteristics-translate.pipe';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';
import { AuthService, AuthStatus } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  standalone: true,
  imports: [RouterLink, KeyValuePairsPipe, ArticleCharacteristicsTranslatePipe, IonButton, IonIcon, IonAvatar, IonText, ToolbarComponent, PostImagesSliderComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private postDetailService = inject(PostDetailService);
  private authService = inject(AuthService);

  #postData = signal<Post | null>(null);
  #itemAdded = signal<boolean>(false);
  isOwnPost = signal<boolean>(true);     

  get postData() {
    return this.#postData.asReadonly();
  }

  get itemAdded() {
    return this.#itemAdded.asReadonly();
  }

  get Math() {
    return Math;
  }

  constructor() { 
    addIcons({ chatbubbleEllipses });

    effect(() => {
      this.isOwnPost.set(this.#postData()?.user?.userId === this.authService.currentUser()?._id);
    })
  }

  ngOnInit() {
    //this.#postData.set(this.route.snapshot.data['postData']);
    const postData$ = this.route.snapshot.data['postData$'];
    if (postData$) {
      postData$.subscribe((postData: Post | null) => {
        this.#postData.set(postData);
      });
    }
  }

  addToCart() {
    this.#itemAdded.set(true);

    const shipping = Math.max((this.postData()?.price ?? 0) / 100, 5);
    console.log(this.postData());

    this.postDetailService.addToCart({
      postId: this.postData()?._id ?? '',
      title: this.postData()?.title ?? '',
      price: this.postData()?.price ?? 0,
      shipping: shipping,
      mainImageURL: this.postData()?.mainImageURL ?? ''
    })
  }
}
