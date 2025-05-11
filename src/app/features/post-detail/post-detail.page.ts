import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostDetailService } from './data-access/post-detail.service';
import { ActivatedRoute } from '@angular/router';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  standalone: true,
  imports: [ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  
  #postData = signal<Post | null>(null);

  get postData() {
    return this.#postData.asReadonly();
  }

  constructor() { }

  ngOnInit() {
    this.#postData.set(this.route.snapshot.data['postData']);
    //this.postData.set(this.postDetailService.getPostData(postId));
    console.log(this.#postData());
  }

}
