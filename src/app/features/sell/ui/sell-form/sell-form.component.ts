import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleCategory } from 'src/app/core/domain/models/article.model';
import { IonIcon, IonLabel, IonInput, IonText, IonCheckbox, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonRow, IonCol, IonButton, IonTextarea, IonBadge } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { cameraOutline, logoEuro } from 'ionicons/icons';
import { AccesoryType, BookTheme, InstrumentBrands, InstrumentLevel, InstrumentType, RecordingFormat } from 'src/app/core/domain/models/articleCharacteristics.interface';

@Component({
  selector: 'app-sell-form',
  templateUrl: './sell-form.component.html',
  styleUrls: ['./sell-form.component.scss'],
  imports: [IonBadge, IonButton, IonCol, IonRow, IonRadioGroup, IonRadio, IonCheckbox, IonSelect, IonSelectOption, IonText, IonInput, IonLabel, IonIcon, IonTextarea, ReactiveFormsModule]
})
export class SellFormComponent  implements OnInit {
  fb: FormBuilder = inject(FormBuilder);

  sellForm!: FormGroup;

  formSubmit = output<void>();
  submitAttempted = input<boolean>(false);
  controlFocus = output<string>();

  uploadImages = output<void>();
  uploadedImagesURLs = input<string[]>([]);
  
  suggestPrice = output<void>();

  categoriesEnum = ArticleCategory;
  categories: ArticleCategory[] = Object.values(ArticleCategory).filter(category => category !== ArticleCategory.None);
  selectedCategory = signal<ArticleCategory>(ArticleCategory.None);
  selectedInstrumentType = signal<InstrumentType>(InstrumentType.None);

  instrumentTypes: string[] = Object.values(InstrumentType).filter(type => type !== InstrumentType.None);
  instrumentBrands = signal<string[]>([]);
  instrumentLevels: string[] = Object.values(InstrumentLevel).filter(type => type !== InstrumentLevel.None);

  accesoryTypes: string[] = Object.values(AccesoryType).filter(type => type !== AccesoryType.None);
  recordingFormats: string[] = Object.values(RecordingFormat).filter(type => type !== RecordingFormat.None);
  bookThemes: string[] = Object.values(BookTheme).filter(type => type !== BookTheme.None);

  disabledPublishButton = input<boolean>(false);
  
  constructor() {
    addIcons({ cameraOutline, logoEuro });
    effect(() => {
      const type = this.selectedInstrumentType();
      this.instrumentBrands.set(this.#getInstrumentBrands(type));
    })
    effect(() => {
      const uploadedImages = this.uploadedImagesURLs();
      if (uploadedImages.length > 0) {
        // Use the first image URL as the background image for the box
        const imageUrl = uploadedImages[0];
        this.#updateUploadImageBoxBackgroud(imageUrl);
      }
    })
  }

  ngOnInit() {
    this.#initForm();
  }

  #initForm() {
    this.sellForm = this.fb.group({
      commonData: this.fb.group({
        title: this.fb.control('', { 
          validators: [Validators.required, Validators.minLength(20)],
          updateOn: 'blur'
        }),
        price: this.fb.control('', { 
          validators: [
            Validators.required, 
            Validators.min(0), 
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
          ],
          updateOn: 'blur'
        }),
        description: this.fb.control('', {
          validators: [Validators.required],
          updateOn: 'blur'
        }),
        category: this.fb.control(this.selectedCategory(), {
          validators: [Validators.required],
          updateOn: 'blur'
        }),
      }),
      specificData: this.fb.group({})
    })
  }

  #updateUploadImageBoxBackgroud(imageUrl: string) {
    const imageBox = document.querySelector('.images-upload-box') as HTMLElement;
    if (imageBox) {
      imageBox.style.backgroundImage = `url(${imageUrl})`;
      imageBox.style.backgroundSize = 'cover';
      imageBox.style.backgroundPosition = 'center';
    }
  }

  #getInstrumentBrands(type: InstrumentType): string[] {
    switch (type) {
      case InstrumentType.String:
        return [
          ...Object.values(InstrumentBrands.String).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Keyboard:
        return [
          ...Object.values(InstrumentBrands.Keyboard).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Wind:
        return [
          ...Object.values(InstrumentBrands.Wind).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Brass:
        return [
          ...Object.values(InstrumentBrands.Brass).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Percussion:
        return [
          ...Object.values(InstrumentBrands.Percussion).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Electronic:
        return [
          ...Object.values(InstrumentBrands.Electronic).filter(brand => brand !== InstrumentBrands.None),
          InstrumentBrands.Other
        ];
      case InstrumentType.Other:
        return [InstrumentBrands.None];
    }
    return [];
  }

  onCategoryChange(event: any) {
    this.selectedCategory.set(event.detail.value);

    if (this.sellForm.contains('specificData')) {
      this.sellForm.removeControl('specificData');
    }

    let specificGroup: FormGroup | undefined;

    switch (this.selectedCategory()) {
      case ArticleCategory.Instruments:
        specificGroup = this.fb.group({
          type: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          brand: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          model: this.fb.control(''),
          color: this.fb.control(''),
          fabricationYear: this.fb.control(''),
          serialNumber: this.fb.control(''),
          instrumentLevel: this.fb.control('')
        });
        break;
      case ArticleCategory.Recordings:
        specificGroup = this.fb.group({
          format: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          recordingTitle: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          artist: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          genre: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          year: this.fb.control(''),
          duration: this.fb.control(''),
          label: this.fb.control(''),
          catalogNumber: this.fb.control(''),
          isrc: this.fb.control(''),
          barcode: this.fb.control(''),
          releaseDate: this.fb.control(''),
          releaseCountry: this.fb.control(''),
          releaseFormat: this.fb.control(''),
          trackCount: this.fb.control(''),
          trackNumber: this.fb.control(''),
        });
        break;
      case ArticleCategory.Accessories:
        specificGroup = this.fb.group({
          name: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          type: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          brand: this.fb.control(''),
          associatedInstrument: this.fb.control('')
        });
        break;
      case ArticleCategory.Professional:
        specificGroup = this.fb.group({
          name: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          brand: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          model: this.fb.control(''),
          color: this.fb.control(''),
          fabricationYear: this.fb.control(''),
          serialNumber: this.fb.control(''),
          accessories: this.fb.control(''),
          warranty: this.fb.control(''),
          warrantyDuration: this.fb.control(''),
          warrantyType: this.fb.control(''),
          warrantyDate: this.fb.control(''),
          warrantyCountry: this.fb.control(''),
        });
        break;
      case ArticleCategory.Books:
        specificGroup = this.fb.group({
          title: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          author: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          theme: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          edition: this.fb.control(''),
          publisher: this.fb.control(''),
          year: this.fb.control(''),
          pages: this.fb.control(''),
          language: this.fb.control(''),
          isbn: this.fb.control(''),
          series: this.fb.control(''),
          volume: this.fb.control(''),
        });
        break;
      case ArticleCategory.Other:
        specificGroup = this.fb.group({
          description: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          })
        })
        break;
      default:
        specificGroup = this.fb.group({});
        break;
    }

    if (specificGroup) {
      this.sellForm.addControl('specificData', specificGroup);
    }
  }

  onInstrumentTypeChange(event: CustomEvent) {
    this.selectedInstrumentType.set(event.detail.value);
  }

}
