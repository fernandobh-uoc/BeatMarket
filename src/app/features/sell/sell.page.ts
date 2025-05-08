import { Component, computed, ElementRef, inject, OnInit, Signal, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PublishFormComponent } from './ui/publish-form/publish-form.component';
import { SellService } from './data-access/sell.service';
import { images, returnUpBackOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.page.html',
  styleUrls: ['./sell.page.scss'],
  standalone: true,
  imports: [PublishFormComponent, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SellPage implements OnInit {
  /* step = signal<number>(1);
  totalSteps = 3;
  progressBarValue = computed(() => (this.step() / this.totalSteps)); */

  sellService = inject(SellService);

  sellFormComponent = viewChild(PublishFormComponent);

  submitAttempted = signal<boolean>(false);
  uploadedImagesURLs = computed(() => this.sellService.imagesDataURLs());

  disabledPublishButton = signal<boolean>(false);

  onControlFocus(control: string) {
    this.submitAttempted.set(false);
  }

  fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild('fileInput');
  onImagesUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      await this.sellService.loadImages();
    } else {
      // Activate hidden file input
      this.fileInput()?.nativeElement.click();
    }
  }

  // Not native platform only
  handleFileInput = async (event: any) => {
    const uploadedImagesURLs = await this.sellService.loadImagesNotNative(event);
  }

  handleFormSubmit() {
    const sellForm: FormGroup<any> | undefined = this.sellFormComponent()?.publishForm;
    console.log(sellForm?.value);

    if (sellForm?.invalid) {
      this.submitAttempted.set(true);
      return;
    }
    
    /* if (this.uploadedImagesURLs().length === 0) 
      return;

    console.log('sell'); */
  }

  ngOnInit() {
  }

}
