import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonItem, IonThumbnail, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { ToolbarComponent } from 'src/app/shared/ui/components/toolbar/toolbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SearchService } from './data-access/search.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { FormatCurrencyPipe } from "../../shared/utils/pipes/format-currency.pipe";
import { addIcons } from 'ionicons';
import { filter, swapVertical } from 'ionicons/icons';
import { ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonIcon, RouterLink, IonLabel, IonThumbnail, IonItem, IonText, ToolbarComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormatCurrencyPipe]
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);

  searchQuery = signal<string>('');
  searchResults = signal<Post[] | null>(null);

  toolbar = viewChild(ToolbarComponent);

  constructor() { 
    addIcons({ swapVertical, filter });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      if (query) {
        this.searchQuery.set(query);
        this.search(query);
      }
    });
  }

  async search(query: string) {
    let searchResults: Post[] | null = await this.searchService.search(query);
    if (!searchResults) return;

    // Manual filter since for some reason firestore doesn't support full-text search :<
    searchResults = searchResults?.filter((result: Post) =>
      (result.title
        .toLowerCase()
        .split(/\s+/)
        .includes(query.toLowerCase()))
    );

    this.searchResults.set(searchResults);
  }

}
