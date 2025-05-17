import { Component, computed, effect, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonItem, IonSelect, IonSelectOption, IonThumbnail, IonLabel, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SearchService } from './data-access/search.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { closeOutline, filter, swapVertical } from 'ionicons/icons';
import { ModalController } from '@ionic/angular/standalone';
import { FiltersModalComponent } from './ui/filters-modal/filters-modal.component';
import { map, Subject } from 'rxjs';



@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonBadge, IonIcon, RouterLink, IonLabel, IonThumbnail, IonItem, IonText, IonSelect, IonSelectOption, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private modalController = inject(ModalController);
     
  //searchQuery = signal<string>('');
  //searchResults = signal<Post[] | null>(null);

  //appliedFilters = signal<any>([]);
  //appliedOrder = signal<Record<string, string>>({ field: 'createdAt', direction: 'desc' });
  //appliedLimit = signal<number>(10);

  searchQuery = computed<string>(() => this.searchService.searchState().query);
  generalFilters = signal<any>([]);
  localFilters = signal<any>([]);
  //appliedFilters = computed<any[]>(() => this.searchService.appliedFilters() || []);
  //appliedOrder = computed<{}>(() => this.searchService.appliedOrder() || { });
  /* appliedFilters = computed<any[]>(() => this.searchService.searchState().constraints.filters);
  appliedOrder = computed<{ field: string, direction: string }>(() => this.searchService.searchState().constraints.orderBy);
  appliedLimit = computed<number>(() => this.searchService.searchState().constraints.limit); */

  searchResults = computed<Post[]>(() => this.searchService.searchState().searchResults);

  query$ = this.route.queryParams.pipe(map(params => params['query']));

  constructor() {
    addIcons({ swapVertical, filter, closeOutline });

    effect(() => {
      console.log({ generalFilters: this.generalFilters() });
      console.log({ localFilters: this.localFilters() });
    })
  }

  ngOnInit() {
    this.query$.subscribe(query => {
      if (query) {
        this.searchService.updateQuery(query);
      }
    });
  }

  onOrderChange(event: any) {
    this.searchService.updateOrder(JSON.parse(event.detail.value));
  }

  async openFiltersModal() {
    const modal = await this.modalController.create({
      component: FiltersModalComponent,
    });
    modal.present();

    const { data: filters, role } = await modal.onWillDismiss();
    if (role === 'filters') {
      const { generalFilters, localFilters } = filters;
      this.generalFilters.set(Object.keys(generalFilters).map(key => ({ field: key, value: generalFilters[key] })));
      this.localFilters.set(Object.keys(localFilters).map(key => ({ field: key, value: localFilters[key] })));

      this.searchService.setFilters({ generalFilters, localFilters });

      /* const _filters = this.#buildFilters(filters, this.appliedFilters());
      this.appliedFilters.set(_filters); */
    }
  }

  

}
