import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { FiltersModalComponent } from '../ui/filters-modal/filters-modal.component';

type Filter = { field: string; operator: string; value: unknown }
  | { and: Filter[] }
  | { or: Filter[] };

type LocalFilter = Record<string, string | string[]>;

type SearchState = {
  query: string;
  constraints?: {
    filters?: Filter[];
    orderBy?: {
      field: string;
      direction: string;
    };
    limit?: number;
  },
  localFilters?: LocalFilter[],
  searchResults: Post[]
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  postRepository = inject(PostRepository);

  searchState: WritableSignal<SearchState> = signal<SearchState>({
    query: '',
    constraints: {
      limit: 100
    },
    localFilters: [],
    searchResults: [],
  });

  searchQuery = computed<string>(() => this.searchState().query);
  appliedFilters = computed<Filter[] | undefined>(() => this.searchState().constraints?.filters);
  appliedOrder = computed<{ field: string, direction: string } | undefined>(() => this.searchState().constraints?.orderBy);
  appliedLimit = computed<number | undefined>(() => this.searchState().constraints?.limit);
  appliedLocalFilters = computed<LocalFilter[] | undefined>(() => this.searchState().localFilters);

  searchResults = computed<Post[]>(() => this.searchState().searchResults);

  errorMessage = signal<string>('');

  constructor() {
    effect(() => {
      const constraints = {
        ...(this.appliedFilters() && { filters: this.appliedFilters() }),
        ...(this.appliedOrder() && { orderBy: this.appliedOrder() }),
        ...(this.appliedLimit() && { limit: this.appliedLimit() })
      };

      this.search({
        query: this.searchQuery(),
        constraints: constraints,
        localFilters: this.appliedLocalFilters()
      })
    });
    /* effect(() => {
      //const [query, constraints] = [this.searchState().query, this.searchState().constraints];
      //const { query, constraints } = this.searchState();
      this.search({ this.searchQuery(), constraints });
    }); */
  }

  updateQuery(query: string) {
    this.searchState.update(state => ({ ...state, query: query }));
  }

  addFilters(filter: Filter | Filter[]) {
    //this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, filters: [...state.constraints?.filters ?? [], filter] } }));
  }

  removeFilter(filter: Filter) {
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, filters: state.constraints?.filters?.filter(f => f !== filter) } }));
  }

  updateOrder(order: { field: string, direction: string }) {
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, orderBy: order } }));
  }

  updateLimit(limit: number) {
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, limit: limit } }));
  }

  addLocalFilter(filter: LocalFilter) {
    this.searchState.update(state => ({ ...state, localFilters: [...state.localFilters ?? [], filter] }));
  }

  removeLocalFilter(filter: LocalFilter) {
    this.searchState.update(state => ({ ...state, localFilters: state.localFilters?.filter(f => f !== filter) }));
  }

  updateSearchResults(searchResults: Post[]) {
    this.searchState.update(state => ({ ...state, searchResults: searchResults }));
  }

  async search({ query, constraints, localFilters }: { query: SearchState['query'], constraints?: SearchState['constraints'], localFilters: SearchState['localFilters'] }) { 
    let searchResults: Post[] | null = null;
    if (constraints) {
      searchResults = await this.queryPosts(constraints);
    } else {
      searchResults = await this.getAllPosts();
    }
    if (!searchResults) return;

    if (query === 'all') {
      this.updateSearchResults(searchResults ?? []);
      return;
    }

    // Manual filter since for some reason firestore doesn't support full-text search :<
    searchResults = searchResults?.filter((result: Post) =>
    (result.title
      .toLowerCase()
      .split(/\s+/)
      .includes(query.toLowerCase()))
    );

    this.updateSearchResults(searchResults ?? []);
  }

  buildFilters(filters: Record<string, any>, appliedFilters: any): any[] {
    //const constraints: any = Object.assign({}, appliedFilters);
    //const filters: any[] = [];

    const _filters = [
      {
        and: [
          { field: 'article.category', operator: '==', value: 'Instrumentos' },
          { field: 'price', operator: '>=', value: 100 },
          {
            or: [
              { field: 'article.condition', operator: '==', value: 'Bueno' },
              { field: 'article.condition', operator: '==', value: 'Nuevo' }
            ]
          }
        ]
      }
    ]

    return _filters;

    /* Object.values(filters).forEach(([key, value]) => {
      if (key === 'category') {
        constraints = {
          ...constraints,
          ...{ field: 'category', operator: '==', value: value }
        }
      }
      if (Array.isArray(value)) {
        constraints = {
          ...constraints,
          []
        }
      }
    }) */
  }

  async getAllPosts(): Promise<Post[] | null> {
    try {
      return await this.postRepository.getAllPosts();
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }

  async queryPosts(constraints: any): Promise<Post[] | null> {
    try {
      return await this.postRepository.queryPosts(constraints);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }
}
