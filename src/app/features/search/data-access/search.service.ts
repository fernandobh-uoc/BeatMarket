import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { FiltersModalComponent } from '../ui/filters-modal/filters-modal.component';
import { orderBy } from 'firebase/firestore';
import { ArticleCharacteristics } from 'src/app/core/domain/models/articleCharacteristics.interface';

type Filter = { field: string; operator: string; value: unknown }
  | { and: Filter[] }
  | { or: Filter[] };

type GeneralFilters = Record<string, any | any[]>
type LocalFilters = Record<string, any | any[]>;

type SearchState = {
  query: string;
  constraints?: {
    filters?: Filter[];
    // orderBy is considered a local filter, so that it isn't needed to create 97869780 annoying firestore indexes
    /* orderBy?: {
      field: string;
      direction: string;
    }; */
    limit?: number;
  },
  localFilters?: LocalFilters,
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
    localFilters: {},
    searchResults: [],
  });

  searchQuery = computed<string>(() => this.searchState().query);
  appliedFilters = computed<Filter[] | undefined>(() => this.searchState().constraints?.filters);
  appliedOrder = computed<{ field: string, direction: string } | undefined>(() => this.searchState().localFilters?.['orderBy']);
  appliedLimit = computed<number | undefined>(() => this.searchState().constraints?.limit);
  appliedLocalFilters = computed<LocalFilters | undefined>(() => this.searchState().localFilters);

  searchResults = computed<Post[]>(() => this.searchState().searchResults);

  errorMessage = signal<string>('');

  constructor() {
    effect(async () => {
      const constraints = {
        ...(this.appliedFilters() && { filters: this.appliedFilters() }),
        ...(this.appliedOrder() && { orderBy: this.appliedOrder() }),
        ...(this.appliedLimit() && { limit: this.appliedLimit() })
      };

      console.log({ constraints });
      console.log({ localFilters: this.appliedLocalFilters() });

      const initialResults = await this.fetchInitialResults({
        query: this.searchQuery(),
        constraints: constraints
      })

      console.log({ initialResults });

      const finalResults = await this.filterInitialResults({
        initialResults: initialResults,
        localFilters: this.appliedLocalFilters()
      });
     
      console.log({ finalResults });
      this.updateSearchResults(finalResults);
    });
  }

  updateQuery(query: string) {
    this.searchState.update(state => ({ ...state, query: query }));
  }

  /* setGeneralFilters(generalFilters: GeneralFilters) {
    //this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, filters: [...state.constraints?.filters ?? [], filter] } }));
    const filters = this.buildConstraintFilters(generalFilters);
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, filters } }));
  }

  setLocalFilters(localFilters: LocalFilters) {
    //this.searchState.update(state => ({ ...state, localFilters: { ...state.localFilters ?? {}, ...filter } })); 
    this.searchState.update(state => ({ ...state, localFilters }));
  } */

  setFilters({ generalFilters, localFilters }: { generalFilters: GeneralFilters, localFilters: LocalFilters }) {
    console.log({ generalFilters });
    console.log({ localFilters });
    this.searchState.update(state => ({ 
      ...state, 
      constraints: { ...state.constraints, filters: this.buildConstraintFilters(generalFilters) },
      localFilters
    }));
  }

  removeFilter(filter: Filter) {
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, filters: state.constraints?.filters?.filter(f => f !== filter) } }));
  }

  updateOrder(order: { field: string, direction: string }) {
    //this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, orderBy: order } }));
    this.searchState.update(state => ({ ...state, localFilters: { ...state.localFilters, orderBy: order } }));
  }

  updateLimit(limit: number) {
    this.searchState.update(state => ({ ...state, constraints: { ...state.constraints, limit: limit } }));
  }


  /* removeLocalFilters(filter: LocalFilters) {
    //this.searchState.update(state => ({ ...state, localFilters: delete state.localFilters?[filter.key] }));  
  } */

  updateSearchResults(searchResults: Post[]) {
    this.searchState.update(state => ({ ...state, searchResults: searchResults }));
  }

  async fetchInitialResults({ query, constraints }: { query: SearchState['query'], constraints?: SearchState['constraints'] }): Promise<Post[]> {   
    let initialSearchResults: Post[] = [];

    if (/* !constraints 
      || Object.keys(this.appliedLocalFilters() as object).length === 0 
      || */ query === 'all'
    ) {
      //return await this.getAllPosts() ?? [];
      //initialSearchResults = await this.getAllPosts() ?? [];
      return await this.queryPosts(constraints) ?? [];
    } else {
      initialSearchResults = await this.queryPosts(constraints) ?? [];
      //if (!initialSearchResults.length) return [];
    }

    // Manual filter since for some reason firestore doesn't support full-text search :<
    return initialSearchResults.filter((result: Post) =>
      (result.title
        .toLowerCase()
        .split(/\s+/)
        .includes(query.toLowerCase())
      )
    );
  }

  async filterInitialResults({ initialResults, localFilters }: { initialResults: Post[], localFilters: SearchState['localFilters'] }): Promise<Post[]> {  
    if (!initialResults || initialResults.length === 0) return [];
    if (!localFilters || Object.keys(localFilters).length === 0) return initialResults;

    const filteredInitialResults = initialResults.filter(this.getPostFilterFn(localFilters));
    if (!this.appliedLocalFilters()?.['orderBy']) return filteredInitialResults;
    
    const { field, direction }: { field: keyof Post, direction: 'asc' | 'desc' } = this.appliedLocalFilters()?.['orderBy'];
    return filteredInitialResults.sort((a: Post, b: Post) => {
      const aValue = a[field] ?? 0;
      const bValue = b[field] ?? 0;
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  getPostFilterFn(localFilters: LocalFilters | undefined): (post: Post) => boolean {
    if (!localFilters) return () => true;
    return (post: Post): boolean => {
      return Object.keys(localFilters)
        .filter(key => key !== 'orderBy')
        .every(key => {
          const filterValue = localFilters[key];
          const postValue = ((post as Post).article.characteristics as any)[key];
          if (Array.isArray(filterValue)) {
            return filterValue.includes(postValue);
          } else {
            return postValue === filterValue;
          }
        });
    }
  }

  buildConstraintFilters(generalFilters: GeneralFilters): Filter[] {
    if (!Object.keys(generalFilters).length) return [];

    let filters: Filter[] = [];

    Object.keys(generalFilters).forEach(key => {
      let value = generalFilters[key];
      if (key === 'category') {
        filters.push({ field: 'article.category', operator: '==', value: value });
      } else if (key === 'priceMin') {
        filters.push({ field: 'price', operator: '>=', value: value });
      } else if (key === 'priceMax') {
        filters.push({ field: 'price', operator: '<=', value: value });
      } else if (key === 'condition') {
        filters.push({ or: value.map((v: any) => ({ field: 'article.condition', operator: '==', value: v })) });
      };
    })

    if (filters.length === 1) {
      return filters;
    } else {
      return [{ and: filters }];
    }
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
