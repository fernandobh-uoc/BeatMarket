import { Component, effect, input, OnInit, signal } from '@angular/core';;

@Component({
  selector: 'app-post-images-slider',
  templateUrl: './post-images-slider.component.html',
  styleUrls: ['./post-images-slider.component.scss'],
})
export class PostImagesSliderComponent  implements OnInit {
  imagesURLs = input<string[]>([]);
  selectedImageURL = signal<string>('');

  constructor() {
    effect(() => {
      const urls = this.imagesURLs();
      if (urls && urls.length > 0) {
        this.selectedImageURL.set(urls[0]);
      }
    })
  }

  ngOnInit() {
  }

}
