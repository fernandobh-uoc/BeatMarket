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

  orderSelectInput = viewChild<IonSelect>('orderSelectInput')

  searchState = computed(() => this.searchService.searchState());

  searchQuery = computed(() => this.searchState().searchParams.query);
  generalFilters = computed(() => this.searchState().searchParams.generalFilters);
  localFilters = computed(() => this.searchState().searchParams.localFilters);
  order = computed(() => this.searchState().searchParams.order);
  searchResults = computed(() => this.searchState().searchResults);

  loading = computed(() => this.searchState().loading);
  errorMessage = computed(() => this.searchState().errorMessage);

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
      this.searchService.setGeneralFilters({ generalFilters: Object.keys(generalFilters).map(key => ({ field: key, value: generalFilters[key] })) });
      this.searchService.setLocalFilters({ localFilters: Object.keys(localFilters).map(key => ({ field: key, value: localFilters[key] })) });
    }
  }

  removeGeneralFilter(filter: any) {
    this.searchService.setGeneralFilters({ generalFilters: this.generalFilters()?.filter((f: GeneralFilter) => f.field !== filter.field) ?? [] });
  }

  removeLocalFilter(filter: any) {
    this.searchService.setLocalFilters({ localFilters: this.localFilters()?.filter((f: LocalFilter) => f.field !== filter.field) ?? [] });
  }
  
  resetAllFilters() {
    this.searchService.setGeneralFilters({ generalFilters: [] });
    this.searchService.setLocalFilters({ localFilters: [] });
    this.removeOrder();
  }

  removeOrder() {
    this.orderSelectInput()?.writeValue(null); 
    this.searchService.updateOrder({ field: 'createdAt', direction: 'asc' });
  }

  onOrderChange(event: any) {
    this.searchService.updateOrder(JSON.parse(event.detail.value));
  }
  
}
