import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonAvatar, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { PostDetailService } from './data-access/post-detail.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PostImagesSliderComponent } from './ui/post-images-slider/post-images-slider.component';
import { addIcons } from 'ionicons';
import { chatbubbleEllipses } from 'ionicons/icons';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { KeyValuePairsPipe } from 'src/app/shared/utils/pipes/key-value-pairs.pipe';
import { ArticleCharacteristicsTranslatePipe } from 'src/app/shared/utils/pipes/article-characteristics-translate.pipe';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CartService } from '../cart/data-access/cart.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  standalone: true,
  imports: [IonSpinner, RouterLink, KeyValuePairsPipe, ArticleCharacteristicsTranslatePipe, IonButton, IonIcon, IonAvatar, IonText, ToolbarComponent, PostImagesSliderComponent, IonContent, IonHeader, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private postDetailService = inject(PostDetailService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  postData = computed(() => this.postDetailService.postDetailState().postData);

  loading = computed(() => this.postDetailService.postDetailState().loading);
  errorMessage = computed(() => this.postDetailService.postDetailState().errorMessage);

  itemIsAdded = computed<boolean>(() => {
    return this.cartService.cartState().cartItems
      .some(item => item.postId === this.postData()?._id) 
      ?? false
  });
  isOwnPost = signal<boolean>(true);

  get Math() {
    return Math;
  }

  constructor() { 
    addIcons({ chatbubbleEllipses });

    effect(() => {
      this.isOwnPost.set(this.postData()?.user?.userId === this.authService.currentUser()?._id);
    })
  }

  async ngOnInit() {
    this.postDetailService.setPostId(this.route.snapshot.paramMap.get('postId') ?? '');
  }

  addToCart() {
    const shipping = Math.max((this.postData()?.price ?? 0) / 100, 5);

    this.postDetailService.addToCart({
      postId: this.postData()?._id ?? '',
      title: this.postData()?.title ?? '',
      price: this.postData()?.price ?? 0,
      shipping: shipping,
      mainImageURL: this.postData()?.mainImageURL ?? ''
    })
  }

  goToConversation(): void {
    this.postDetailService.loadConversation();
  }
}
