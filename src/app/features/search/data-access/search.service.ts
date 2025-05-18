import { computed, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { FiltersModalComponent } from '../ui/filters-modal/filters-modal.component';
import { orderBy } from 'firebase/firestore';
import { ArticleCharacteristics } from 'src/app/core/domain/models/articleCharacteristics.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, debounceTime, Observable, of, Subject, switchMap, tap } from 'rxjs';

type FirestoreFilter = { field: string; operator: string; value: unknown }
  | { and: FirestoreFilter[] }
  | { or: FirestoreFilter[] };

export type GeneralFilter = { field: string, value: any };
export type LocalFilter = { field: string, value: any };

type SearchState = {
  query: Signal<string>,
  generalFilters: Signal<GeneralFilter[]>,
  localFilters: Signal<LocalFilter[]>,
  order: Signal<{ field: keyof PostModel, direction: 'asc' | 'desc' }>,
  limit: Signal<number>,
  searchResults: Post[],
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  postRepository = inject(PostRepository);

  generalFilters$ = new BehaviorSubject<GeneralFilter[]>([]);
  limit$ = new BehaviorSubject<number>(100);
  searchQuery$ = new BehaviorSubject<string>('');
  localFilters$ = new BehaviorSubject<LocalFilter[]>([]);
  order$ = new BehaviorSubject<{ field: keyof PostModel, direction: 'asc' | 'desc' }>({ field: 'createdAt', direction: 'asc' });

  searchState: WritableSignal<SearchState> = signal<SearchState>({
    query: toSignal(this.searchQuery$, { initialValue: '' }),
    generalFilters: toSignal(this.generalFilters$, { initialValue: [] }),
    localFilters: toSignal(this.localFilters$, { initialValue: [] }),
    order: toSignal(this.order$, { initialValue: { field: 'createdAt', direction: 'asc' } }),
    limit: toSignal(this.limit$, { initialValue: 100 }),
    searchResults: [],
  });

  
  //searchResults = signal<Post[]>([]);

  /* searchQuery = computed<string>(() => this.searchState().query);

  constraintFilters = computed<Filter[]>(() => this.searchState().constraints?.filters || []);
  constraintLimit = computed<number>(() => this.searchState().constraints?.limit || 100);

  localFilters = computed<LocalFilters>(() => this.searchState().localFilters || {});
  localOrder = computed<{ field: keyof PostModel, direction: 'asc' | 'desc' }>(() => this.searchState().order || { field: 'createdAt', direction: 'asc' }); */ 

  

  searchResults = computed<Post[]>(() => this.searchState().searchResults);

  errorMessage = signal<string>('');

  constructor() {
    combineLatest([this.searchQuery$, this.generalFilters$, this.limit$, this.order$, this.localFilters$])
      .pipe(
        debounceTime(0),
        tap(() => {
          console.log({ constraintFilters: this.buildConstraintFilters(this.generalFilters$.getValue()) });
          console.log({ localFilters: this.localFilters$.getValue() });
        }),
        switchMap(async ([query, filters, limit, order, localFilters]) => {
          const constraints = {
            filters: this.buildConstraintFilters(filters),
            limit,
          };

          const initialResults = await this.fetchInitialResults({ constraints });
          const filteredResults = this.filterResults({ results: initialResults, query, localFilters });
          const finalResults = this.sortResults({ results: filteredResults, order });

          return finalResults;
        })
      )
      .subscribe(results => {
        this.updateSearchResults(results);
      });
  }

  updateQuery(query: string) {
    this.searchQuery$.next(query);
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
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }

    /* if (query === 'all') return initialSearchResults;

    return initialSearchResults.filter((result: Post) =>
    (result.title
      .toLowerCase()
      .split(/\s+/)
      .includes(query.toLowerCase())
    )
    ); */
  }

  /* fetchInitialResults$({ query, constraints }: { query: SearchState['query'], constraints?: SearchState['constraints'] }): Observable<Post[] | null> {
    let initialSearchResults$: Observable<Post[] | null> = this.queryPosts$(constraints) ?? of([]); 
    if (!initialSearchResults$) return of([]);

    if (query === 'all') return initialSearchResults$;

    return 
  } */
 
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

    /* if (!this.appliedLocalFilters()?.['orderBy']) return filteredInitialResults;

    const { field, direction }: { field: keyof Post, direction: 'asc' | 'desc' } = this.appliedLocalFilters()?.['orderBy'];
    return this.sortResults(filteredInitialResults, { field, direction }); */
  }

  /* buildPostFilterFn(localFilters: LocalFilters | undefined): (post: Post) => boolean {
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
  } */

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

  /* async getAllPosts(): Promise<Post[] | null> {
    try {
      return await this.postRepository.getAllPosts();
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  } */

  async queryPosts(constraints: any): Promise<Post[] | null> {
    try {
      return await this.postRepository.queryPosts(constraints);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }

  queryPosts$(constraints: any): Observable<Post[] | null> | null {
    if (!this.postRepository.queryPosts$) return null;
    try {
      return this.postRepository.queryPosts$(constraints);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }


}
