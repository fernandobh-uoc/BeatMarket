import { Component, computed, effect, inject, OnInit, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonItem, IonSelect, IonSelectOption, IonThumbnail, IonLabel, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GeneralFilter, LocalFilter, SearchService } from './data-access/search.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { closeOutline, filter, gitBranchSharp, swapVertical } from 'ionicons/icons';
import { ModalController } from '@ionic/angular/standalone';
import { FiltersModalComponent } from './ui/filters-modal/filters-modal.component';
import { map, Subject } from 'rxjs';
import { TranslateFilterKeyPipe } from './utils/translate-filter-key.pipe';
import { TranslateFilterValuePipe } from './utils/translate-filter-value.pipe';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonSpinner, TranslateFilterKeyPipe, TranslateFilterValuePipe, IonBadge, IonIcon, RouterLink, IonLabel, IonThumbnail, IonItem, IonText, IonSelect, IonSelectOption, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private modalController = inject(ModalController);

  //searchQuery = computed<string>(() => this.searchService.searchQuery$.getValue());
  //generalFilters = signal<GeneralFilter[]>([]);
  //localFilters = signal<LocalFilter[]>([]);
  //generalFilters = computed<GeneralFilter[]>(() => this.searchService.generalFilters$.getValue());
  //localFilters = computed<LocalFilter[]>(() => this.searchService.localFilters$.getValue());

  /* searchQuery: Signal<string> = toSignal(this.searchService.searchQuery$, { initialValue: '' });
  generalFilters: Signal<GeneralFilter[]> = toSignal(this.searchService.generalFilters$, { initialValue: [] }); 
  localFilters: Signal<LocalFilter[]> = toSignal(this.searchService.localFilters$, { initialValue: [] }); */

  orderSelectInput = viewChild<IonSelect>('orderSelectInput')

  searchQuery = computed(() => this.searchService.query());
  generalFilters = computed(() => this.searchService.generalFilters());
  localFilters = computed(() => this.searchService.localFilters());
  order = computed(() => this.searchService.order());
  searchResults = computed<Post[]>(() => this.searchService.searchResults());

  loading = computed(() => this.searchService.loading());
  errorMessage = computed(() => this.searchService.errorMessage());

  query$ = this.route.queryParams.pipe(map(params => params['query']));

  constructor() {
    addIcons({ swapVertical, filter, closeOutline });
  }

  ngOnInit() {
    this.query$.subscribe(query => {
      if (query) {
        this.searchService.updateQuery(query);
      }
    });
  }

  async openFiltersModal() {
    const modal = await this.modalController.create({
      component: FiltersModalComponent,
    });
    modal.present();

    const { data: filters, role } = await modal.onWillDismiss();

    if (role === 'filters') {
      const { generalFilters, localFilters } = filters;
      //this.generalFilters.set(Object.keys(generalFilters).map(key => ({ field: key, value: generalFilters[key] })));
      //this.localFilters.set(Object.keys(localFilters).map(key => ({ field: key, value: localFilters[key] })));

      this.searchService.setGeneralFilters({ generalFilters: Object.keys(generalFilters).map(key => ({ field: key, value: generalFilters[key] })) });
      this.searchService.setLocalFilters({ localFilters: Object.keys(localFilters).map(key => ({ field: key, value: localFilters[key] })) });

      /* this.searchService.generalFilters$.next(Object.keys(generalFilters).map(key => ({ field: key, value: generalFilters[key] })));
      this.searchService.localFilters$.next(Object.keys(localFilters).map(key => ({ field: key, value: localFilters[key] }))); */
    }
  }

  removeGeneralFilter(filter: any) {
    //this.generalFilters.update((filters) => filters.filter((f: GeneralFilter) => f.field !== filter.field));
    this.searchService.setGeneralFilters({ generalFilters: this.generalFilters()?.filter((f: GeneralFilter) => f.field !== filter.field) ?? [] });
    //this.searchService.generalFilters$.next(this.generalFilters()?.filter((f: GeneralFilter) => f.field !== filter.field) ?? []);
  }

  removeLocalFilter(filter: any) {
    //this.localFilters.update((filters) => filters.filter((f: LocalFilter) => f.field !== filter.field));
    this.searchService.setLocalFilters({ localFilters: this.localFilters()?.filter((f: LocalFilter) => f.field !== filter.field) ?? [] });
    //this.searchService.localFilters$.next(this.localFilters()?.filter((f: LocalFilter) => f.field !== filter.field) ?? []);
  }
  
  resetAllFilters() {
    //this.generalFilters.set([]);
    //this.localFilters.set([]);

    this.searchService.setGeneralFilters({ generalFilters: [] });
    this.searchService.setLocalFilters({ localFilters: [] });
    this.removeOrder();
    //this.searchService.generalFilters$.next([]);
    //this.searchService.localFilters$.next([]);
  }

  removeOrder() {
    this.orderSelectInput()?.writeValue(null); 
    this.searchService.updateOrder({ field: 'createdAt', direction: 'asc' });
  }

  onOrderChange(event: any) {
    this.searchService.updateOrder(JSON.parse(event.detail.value));
    //this.searchService.order$.next(JSON.parse(event.detail.value));
  }
  
}
