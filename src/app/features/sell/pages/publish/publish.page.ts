import { Component, computed, ElementRef, inject, OnInit, Signal, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormGroup, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { PublishFormComponent } from '../../ui/publish-form/publish-form.component';
import { SellService } from '../../data-access/sell.service';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './publish.page.html',
  styleUrls: ['./publish.page.scss'],
  standalone: true,
  imports: [PublishFormComponent, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PublishPage implements OnInit {
  sellService = inject(SellService);
  router = inject(Router);

  publishFormComponent = viewChild(PublishFormComponent);

  publishErrorMessage = computed(() => this.sellService.errorMessage());

  uploadedImagesURLs = computed(() => this.sellService.imagesDataURLs());
  submitAttempted = signal<boolean>(false);

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

  async handleFormSubmit() {
    this.submitAttempted.set(true);

    const publishForm: FormGroup<any> | undefined = this.publishFormComponent()?.publishForm;
    publishForm?.updateValueAndValidity();

    console.log('Invalid controls:', this.findInvalidControls(publishForm));

    console.log(publishForm?.value);

    if (publishForm?.invalid) {
      return;
    }

    if (this.uploadedImagesURLs().length === 0) {
      return;
    }

    console.log({
      ...publishForm?.value.commonData,
      characteristics: publishForm?.value.specificData,
    });

    this.disabledPublishButton.set(true);

    await this.sellService.publishPost({
      ...publishForm?.value.commonData,
      characteristics: {
        ...publishForm?.value.specificData,
        category: publishForm?.value.commonData.category // Append category to characteristics for discrimination on PostConverter
      },
    });
    
    if (!this.publishErrorMessage()) {
      this.router.navigate(['/tabs/sell/splash']);
    }
  }

  findInvalidControls(control: AbstractControl | undefined, path = ''): string[] {
    const invalid: string[] = [];

    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];
        const fullPath = path ? `${path}.${key}` : key;

        if (childControl.invalid) {
          invalid.push(...this.findInvalidControls(childControl, fullPath));
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((childControl, index) => {
        const fullPath = `${path}[${index}]`;

        if (childControl.invalid) {
          invalid.push(...this.findInvalidControls(childControl, fullPath));
        }
      });
    } else if (control?.invalid) {
      invalid.push(`${path}: ${JSON.stringify(control.errors)}`);
    }

    return invalid;
  }

  ngOnInit() {
  }

}
