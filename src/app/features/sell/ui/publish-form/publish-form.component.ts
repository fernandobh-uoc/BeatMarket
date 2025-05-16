import { Component, computed, effect, inject, input, OnInit, output, Signal, signal, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViewDidEnter } from '@ionic/angular';
import { ArticleCategory, ArticleCondition } from 'src/app/core/domain/models/article.model';
import { IonIcon, IonLabel, IonInput, IonText, IonCheckbox, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonRow, IonCol, IonButton, IonTextarea, IonBadge } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { cameraOutline, logoEuro } from 'ionicons/icons';
import { AccesoryType, BookTheme, InstrumentBrands, InstrumentLevel, InstrumentType, ProfessionalType, RecordingFormat, RecordingGenre } from 'src/app/core/domain/models/articleCharacteristics.interface';
import { FormatCurrencyPipe } from 'src/app/shared/utils/pipes/format-currency.pipe';

@Component({
  selector: 'app-publish-form',
  templateUrl: './publish-form.component.html',
  styleUrls: ['./publish-form.component.scss'],
  imports: [IonBadge, IonButton, IonCol, IonRow, IonRadioGroup, IonRadio, IonCheckbox, IonSelect, IonSelectOption, IonText, IonInput, IonLabel, IonIcon, IonTextarea, ReactiveFormsModule],
  providers: [FormatCurrencyPipe]
})
export class PublishFormComponent {
  fb: FormBuilder = inject(FormBuilder);
  currencyPipe = inject(FormatCurrencyPipe);

  publishForm!: FormGroup;
  //@ViewChild('titleInput') titleInput!: IonInput;
  titleInput: Signal<IonInput | undefined> = viewChild('titleInput');

  formSubmit = output<void>();
  submitAttempted = input<boolean>(false);
  controlFocus = output<string>();
  focusedInput = signal<string>('');

  uploadImages = output<void>();
  uploadedImagesURLs = input<string[]>([]);
  
  isPriceFocused = false;
  suggestPrice = output<void>();

  conditionsEnum = ArticleCondition;
  conditions: ArticleCondition[] = Object.values(ArticleCondition).filter(condition => condition !== ArticleCondition.None);

  categoriesEnum = ArticleCategory;
  categories: ArticleCategory[] = Object.values(ArticleCategory).filter(category => category !== ArticleCategory.None);
  selectedCategory = signal<ArticleCategory>(ArticleCategory.None);
  selectedInstrumentType = signal<InstrumentType>(InstrumentType.None);

  instrumentTypes: string[] = Object.values(InstrumentType).filter(type => type !== InstrumentType.None);
  instrumentBrands = signal<string[]>([]);
  instrumentLevels: string[] = Object.values(InstrumentLevel).filter(type => type !== InstrumentLevel.None);
  accesoryTypes: string[] = Object.values(AccesoryType).filter(type => type !== AccesoryType.None);
  recordingFormats: string[] = Object.values(RecordingFormat).filter(type => type !== RecordingFormat.None);
  recordingGenres: string[] = Object.values(RecordingGenre).filter(type => type !== RecordingGenre.None);
  bookThemes: string[] = Object.values(BookTheme).filter(type => type !== BookTheme.None);
  professionalTypes: string[] = Object.values(ProfessionalType).filter(type => type !== ProfessionalType.None);

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
      } else {
        this.#updateUploadImageBoxBackgroud('');
      }
    })
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.publishForm = this.fb.group({
      commonData: this.fb.group({
        title: this.fb.control('', { 
          validators: [Validators.required, Validators.minLength(10)],
          updateOn: 'blur'
        }),
        price: this.fb.control('', { 
          validators: [
            Validators.required, 
            Validators.min(0)
          ],
          updateOn: 'blur'
        }),
        description: this.fb.control('', {
          validators: [Validators.required],
          updateOn: 'blur'
        }),
        condition: this.fb.control('', {
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

  resetForm() {
    this.selectedCategory.set(this.categoriesEnum.None);
    this.publishForm.reset();
  } 

  focusTitleInput() {
    this.titleInput()?.setFocus();
  }

  formatPrice() {
    const value = this.publishForm.get('commonData.price')?.value;
    if (!isNaN(value)) {
      const formatted = this.currencyPipe.transform(value, false); // pipe injected
      this.publishForm.get('commonData.price')?.setValue(formatted);
    }
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
        return [InstrumentBrands.Other];
    }
    return [InstrumentBrands.None];
  }

  onCategoryChange(event: any) {
    this.selectedCategory.set(event.detail.value);

    if (this.publishForm.contains('specificData')) {
      this.publishForm.removeControl('specificData');
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
          artist: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          genre: this.fb.control('', {
            validators: [Validators.required, Validators.maxLength(4)],
            updateOn: 'blur'
          }),
          recordingTitle: this.fb.control(''),
          year: this.fb.control(''),
          duration: this.fb.control(''),
          label: this.fb.control(''),
          catalogNumber: this.fb.control(''),
          isrc: this.fb.control(''),
          barcode: this.fb.control(''),
          releaseDate: this.fb.control(''),
          releaseCountry: this.fb.control(''),
          releaseFormat: this.fb.control(''),
          trackCount: this.fb.control('')
        });
        break;
      case ArticleCategory.Accessories:
        specificGroup = this.fb.group({
          type: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          name: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          brand: this.fb.control(''),
          color: this.fb.control(''),
          associatedInstrument: this.fb.control('')
        });
        break;
      case ArticleCategory.Professional:
        specificGroup = this.fb.group({
          type: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          name: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          brand: this.fb.control('', { 
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          model: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          serialNumber: this.fb.control('', {
            validators: [Validators.required],
            updateOn: 'blur'
          }),
          color: this.fb.control(''),
          fabricationYear: this.fb.control(''),
          accessories: this.fb.control(''),
          warranty: this.fb.control(''),
          warrantyDuration: this.fb.control(''),
          warrantyType: this.fb.control(''),
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
      this.publishForm.setControl('specificData', specificGroup);
    }
  }

  onInstrumentTypeChange(event: CustomEvent) {
    this.selectedInstrumentType.set(event.detail.value);
  }

}
