import { computed, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { FiltersModalComponent } from '../ui/filters-modal/filters-modal.component';
import { orderBy } from 'firebase/firestore';
import { ArticleCharacteristics } from 'src/app/core/domain/models/articleCharacteristics.interface';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, debounceTime, delay, Observable, of, Subject, switchMap, tap } from 'rxjs';

type FirestoreFilter = { field: string; operator: string; value: unknown }
  | { and: FirestoreFilter[] }
  | { or: FirestoreFilter[] };

export type GeneralFilter = { field: string, value: any };
export type LocalFilter = { field: string, value: any };

type SearchState = {
  searchParams: {
    query: string,
    generalFilters: GeneralFilter[],
    localFilters: LocalFilter[],
    order: { field: string, direction: 'asc' | 'desc' },
    limit: number,
  }
  searchResults: Post[],
  loading: boolean,
  errorMessage: any
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  postRepository = inject(PostRepository);

  private query$ = new BehaviorSubject<string>('');
  private generalFilters$ = new BehaviorSubject<GeneralFilter[]>([]);
  private limit$ = new BehaviorSubject<number>(100);
  private localFilters$ = new BehaviorSubject<LocalFilter[]>([]);
  private order$ = new BehaviorSubject<{ field: keyof PostModel, direction: 'asc' | 'desc' }>({ field: 'createdAt', direction: 'asc' });

  private searchState: WritableSignal<SearchState> = signal<SearchState>({
    /* query: toSignal(this.searchQuery$, { initialValue: '' }),
    generalFilters: toSignal(this.generalFilters$, { initialValue: [] }),
    localFilters: toSignal(this.localFilters$, { initialValue: [] }),
    order: toSignal(this.order$, { initialValue: { field: 'createdAt', direction: 'asc' } }),
    limit: toSignal(this.limit$, { initialValue: 100 }), */
    searchParams: {
      query: '',
      generalFilters: [],
      localFilters: [],
      order: { field: 'createdAt', direction: 'asc' },
      limit: 100,
    },
    searchResults: [],
    loading: false,
    errorMessage: ''
  }); 

  query = computed<string>(() => this.searchState().searchParams.query);
  generalFilters = computed<GeneralFilter[]>(() => this.searchState().searchParams.generalFilters);
  localFilters = computed<LocalFilter[]>(() => this.searchState().searchParams.localFilters);
  order = computed<{ field: string, direction: 'asc' | 'desc' }>(() => this.searchState().searchParams.order);
  limit = computed<number>(() => this.searchState().searchParams.limit);
  searchResults = computed<Post[]>(() => this.searchState().searchResults);

  loading = computed(() => this.searchState().loading);
  errorMessage = computed<string>(() => this.searchState().errorMessage); 

  constructor() {
    combineLatest([this.query$, this.generalFilters$, this.limit$, this.order$, this.localFilters$])
      .pipe(
        debounceTime(0),
        tap(() => this.searchState.update(state => ({ ...state, loading: true }))),
        switchMap(async ([query, generalFilters, limit, order, localFilters]) => {
          const constraints = {
            filters: this.buildConstraintFilters(generalFilters),
            limit,
          };

          const initialResults: Post[] = await this.fetchInitialResults({ constraints });
          const filteredResults: Post[] = this.filterResults({ results: initialResults, query, localFilters });
          const finalResults: Post[] = this.sortResults({ results: filteredResults, order });

          return {
            searchResults: finalResults,
            searchParams: { query, generalFilters, localFilters, order, limit }
          };
        }),
        takeUntilDestroyed(),
        catchError(error => {
          console.error(error);
          this.searchState.update(state => ({ 
            ...state, 
            loading: false, 
            errorMessage: error as string 
          }));
          return of(null);
        })
      )
      .subscribe((value) => {
        if (!value) return;
        const { searchResults, searchParams } = value;
        this.searchState.update(state => ({
          ...state,
          searchParams,
          loading: false,
          searchResults,
        }));
      });
  }

  updateQuery(query: string) {
    this.query$.next(query);
  }

  setGeneralFilters({ generalFilters }: { generalFilters: GeneralFilter[] }): void {
    this.generalFilters$.next(generalFilters);
  }

  setLocalFilters({ localFilters }: { localFilters: LocalFilter[] }): void {
    this.localFilters$.next(localFilters);
  }

  updateOrder(order: { field: keyof PostModel, direction: 'asc' | 'desc' }) {
    this.order$.next(order);
  }

  updateSearchResults(searchResults: Post[]) {
    this.searchState.update(state => ({ ...state, searchResults: searchResults }));
    //this.searchResults.set(searchResults);
  }

  async fetchInitialResults({ constraints }: { constraints?: any }): Promise<Post[]> {  
    try {
      return await this.postRepository.queryPosts(constraints) ?? [];
    } catch (error) {
      throw error;
    }
  }

  fetchInitialResults$({ constraints }: { constraints?: any }): Observable<Post[] | null> { 
    if (!this.postRepository.queryPosts$) return of([]);
    try {
      return this.postRepository.queryPosts$(constraints) ?? of([]);
    } catch (error) {
      throw error;
    }
  }
 
  filterResults({ results, query, localFilters }: { results: Post[], query: string, localFilters: LocalFilter[] }): Post[] { 
    let filteredResults: Post[] = results;

    if (query !== 'all') {
      filteredResults = results.filter((result: Post) =>
        (result.title
          .toLowerCase()
          .split(/\s+/)
          .includes(query.toLowerCase())
        )
      );
    }

    if (localFilters.length > 0) {
      //initialResults = initialResults.filter(this.buildPostFilterFn(localFilters));
      filteredResults = filteredResults.filter((post: Post) => {
        return localFilters.every((filter: LocalFilter) => {
          const filterValue = filter.value;
          const postValue = ((post as Post).article.characteristics as any)[filter.field];
          if (Array.isArray(filterValue)) {
            return filterValue.includes(postValue);
          } else {
            return postValue === filterValue;
          }
        });
      })
    }

    return filteredResults;
  }

  sortResults({ results, order }: { results: Post[], order: { field: keyof PostModel, direction: 'asc' | 'desc' } }): Post[] {
    return results.sort((a: PostModel, b: PostModel) => {
      const aValue = a[order.field] ?? 0;
      const bValue = b[order.field] ?? 0;
      if (aValue < bValue) {
        return order.direction === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order.direction === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  buildConstraintFilters(generalFilters: GeneralFilter[]): FirestoreFilter[] {
    if (!Object.keys(generalFilters).length) return [];

    let filters: FirestoreFilter[] = [];

    generalFilters.forEach((filter: GeneralFilter) => {
      let { field, value } = filter;
      if (field === 'category') {
        filters.push({ field: 'article.category', operator: '==', value: value });
      } else if (field === 'priceMin') {
        filters.push({ field: 'price', operator: '>=', value: value });
      } else if (field === 'priceMax') {
        filters.push({ field: 'price', operator: '<=', value: value });
      } else if (field === 'condition') {
        filters.push({ or: value.map((v: any) => ({ field: 'article.condition', operator: '==', value: v })) });
      };
    })

    if (filters.length === 1) {
      return filters;
    } else {
      return [{ and: filters }];
    }
  }



}
