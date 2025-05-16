import { Component, effect, inject, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonSelect, IonSelectOption, IonItem, IonInput, ModalController, IonText, IonLabel, IonRadioGroup, IonRadio, IonRow, IonCol, IonRange, IonCheckbox, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeOutline, key } from 'ionicons/icons';
import { ArticleCategory, ArticleCondition } from 'src/app/core/domain/models/article.model';
import { AccesoryType, BookTheme, InstrumentBrands, InstrumentLevel, InstrumentType, ProfessionalType, RecordingFormat, RecordingGenre } from 'src/app/core/domain/models/articleCharacteristics.interface';
import { FormatCurrencyPipe } from 'src/app/shared/utils/pipes/format-currency.pipe';

@Component({
  selector: 'app-filters-modal',
  templateUrl: './filters-modal.component.html',
  styleUrls: ['./filters-modal.component.scss'],
  imports: [IonIcon, IonCheckbox, IonRange, IonCol, IonRow, IonRadioGroup, IonRadio, IonSelect, IonSelectOption, IonLabel, IonText, IonInput, IonItem, IonContent, IonTitle, IonButton, IonButtons, IonToolbar, IonHeader],
  providers: [FormatCurrencyPipe]
})
export class FiltersModalComponent implements OnInit {
  private modalController = inject(ModalController);
  
  currencyPipe = inject(FormatCurrencyPipe);

  generalFilters = signal<any>({});
  specificFilters = signal<any>({});

  categoriesEnum = ArticleCategory;
  categories: ArticleCategory[] = Object.values(ArticleCategory).filter(category => category !== ArticleCategory.None);
  selectedCategory = signal<ArticleCategory>(ArticleCategory.None);

  conditionEnum = ArticleCondition;
  conditions: ArticleCondition[] = Object.values(ArticleCondition).filter(condition => condition !== ArticleCondition.None);

  instrumentTypes: string[] = Object.values(InstrumentType).filter(type => type !== InstrumentType.None);
  instrumentBrands: string[] = Object.values(InstrumentBrands).filter(value => typeof value === 'object').map(value => Object.values(value)).flat();   
  instrumentLevels: string[] = Object.values(InstrumentLevel).filter(type => type !== InstrumentLevel.None);
  accesoryTypes: string[] = Object.values(AccesoryType).filter(type => type !== AccesoryType.None);
  recordingFormats: string[] = Object.values(RecordingFormat).filter(type => type !== RecordingFormat.None);
  recordingGenres: string[] = Object.values(RecordingGenre).filter(type => type !== RecordingGenre.None);
  bookThemes: string[] = Object.values(BookTheme).filter(type => type !== BookTheme.None);
  professionalTypes: string[] = Object.values(ProfessionalType).filter(type => type !== ProfessionalType.None);

  priceMin = viewChild<IonInput>('priceMin');
  priceMax = viewChild<IonInput>('priceMax');
  priceErrorMessage = signal<string>('');

  constructor() {
    addIcons({ closeOutline });
    effect(() => console.log({ generalFilters: this.generalFilters() }));
    effect(() => console.log({ specificFilters: this.specificFilters() }));
  }

  ngOnInit() { }

  onCategoryChange(event: any) {
    this.selectedCategory.set(event.detail.value);
    this.specificFilters.set([]);
  }

  confirm() {
    console.log("confirm");
    return this.modalController.dismiss('confirmData', 'confirm');
  }

  cancel() {
    console.log("cancel");
    return this.modalController.dismiss('cancelData', 'cancel');
  }

  applyFilters() {
    console.log("filter");
    if (this.priceErrorMessage()) return null;

    return this.modalController.dismiss({
      constraints: {
        category: 'Grabaciones',
        price: [10, 50],
        condition: ['Nuevo', 'Bueno']
      },
      localFilters: [

      ]
    }, 'filters');
  }

  addGeneralFilter(filter: { key: string, value: any }) {
    if (filter.key === 'priceMin' || filter.key === 'priceMax') {
      filter.value = parseFloat(filter.value);
    }
    this.generalFilters.set({ ...this.generalFilters(), [filter.key]: filter.value });
  }

  addSpecificFilter(filter: { key: string, value: any }) {
    this.specificFilters.set({ ...this.specificFilters(), [filter.key]: filter.value });
  }

  onCheckboxChangeGeneral(event: any, filterData: { key: string, value: any }) {
    if (event.detail.checked) {
      this.addGeneralFilter({ key: filterData.key, value: [...(this.generalFilters()[filterData.key] ?? []), filterData.value] });
    } else {
      if (Array.isArray(this.generalFilters()[filterData.key]) && this.generalFilters()[filterData.key].length === 1) {
        delete this.generalFilters()[filterData.key];
      } else {
        this.addGeneralFilter({ key: filterData.key, value: this.generalFilters()[filterData.key]?.filter((f: string) => f !== filterData.value) });
      }
    }
    console.log({ generalFilters: this.generalFilters() });
  }

  onCheckboxChangeSpecific(event: any, filterData: { key: string, value: any }) {
    if (event.detail.checked) {
      this.addSpecificFilter({ key: filterData.key, value: [...(this.specificFilters()[filterData.key] ?? []), filterData.value] });
    } else {
      if (Array.isArray(this.specificFilters()[filterData.key]) && this.specificFilters()[filterData.key].length === 1) {
        delete this.specificFilters()[filterData.key];
      } else {
        this.addSpecificFilter({ key: filterData.key, value: this.specificFilters()[filterData.key]?.filter((f: string) => f !== filterData.value) });
      }
    }
  }

  checkPriceValid(): boolean {
    if (this.priceMin()?.value && this.priceMax()?.value) {
      if (parseFloat(this.priceMin()?.value?.toString() || '0') > parseFloat(this.priceMax()?.value?.toString() || '0')) { 
        this.priceErrorMessage.set('El precio mínimo debe ser menor o igual al precio máximo');
        return false;
      } else {
        this.priceErrorMessage.set('');
        return true;
      }
    }
    return true;
  }

  formatPrice(input: string, value: any) {
    if (isNaN(value)) return;
    const formatted = this.currencyPipe.transform(value, false); 

    if (input === 'priceMin') {
      const priceMinInput = this.priceMin();
      if (priceMinInput) {
        priceMinInput.value = formatted;
      }
    }
    if (input === 'priceMax') { 
      const priceMaxInput = this.priceMax();
      if (priceMaxInput) {
        priceMaxInput.value = formatted;
      }
    }
  }
}
