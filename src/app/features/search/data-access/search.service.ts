import { Injectable, inject, signal, computed, resource } from "@angular/core";
import { Post, PostModel } from "src/app/core/domain/models/post.model";
import { PostRepository } from "src/app/core/domain/repositories/post.repository";

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
    order: { field: keyof PostModel, direction: 'asc' | 'desc' },
    limit: number,
  }
  searchResults: Post[],
  loading: boolean,
  errorMessage: any
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private postRepository = inject(PostRepository);

  private query = signal<string>('');
  private generalFilters = signal<GeneralFilter[]>([]);
  private localFilters = signal<LocalFilter[]>([]);
  private order = signal<{ field: keyof PostModel; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'asc',
  });
  private limit = signal<number>(100);
  private errorMessage = signal<string>('');

  searchState = computed<SearchState>(() => ({
    searchParams: {
      query: this.query(),
      generalFilters: this.generalFilters(),
      localFilters: this.localFilters(),
      order: this.order(),
      limit: this.limit(),
    },
    searchResults: this.searchResults(),
    loading: this.initialResults.isLoading(),
    errorMessage: this.errorMessage(),
  }));

  private initialResults = resource({
    request: () => ({
      query: this.query(),
      generalFilters: this.generalFilters(),
      limit: this.limit(),
    }),
    loader: async ({ request }) => {
      const { generalFilters, limit } = request;

      try {
        this.errorMessage.set('');

        const constraints = {
          filters: this.buildConstraintFilters(generalFilters),
          limit,
        };

        const results = await this.fetchInitialResults({ constraints });

        return results;
      } catch (err) {
        this.errorMessage.set((err as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  });

  private searchResults = computed(() => {
    const initialResults = this.initialResults.value() ?? [];
    const query = this.query();
    const localFilters = this.localFilters();
    const order = this.order();

    const filteredResults = this.filterResults({ results: initialResults, query, localFilters });
    const sortedResults = this.sortResults({ results: filteredResults, order });

    return sortedResults;
  })

  updateQuery(query: string) {
    this.query.set(query);
  }

  setGeneralFilters({ generalFilters }: { generalFilters: GeneralFilter[] }) {
    this.generalFilters.set(generalFilters);
  }

  setLocalFilters({ localFilters }: { localFilters: LocalFilter[] }) {
    this.localFilters.set(localFilters);
  }

  updateOrder(order: { field: keyof PostModel; direction: 'asc' | 'desc' }) {
    this.order.set(order);
  }

  updateLimit(limit: number) {
    this.limit.set(limit);
  }

  private async fetchInitialResults({ constraints }: { constraints?: any }): Promise<Post[]> {
    try {
      return (await this.postRepository.queryPosts(constraints)) ?? [];
    } catch (error) {
      throw error;
    }
  }

  private filterResults({
    results,
    query,
    localFilters,
  }: {
    results: Post[];
    query: string;
    localFilters: LocalFilter[];
  }): Post[] {
    let filteredResults: Post[] = results;

    if (query !== 'all') {
      filteredResults = results.filter((result: Post) =>
        result.title.toLowerCase().split(/\s+/).includes(query.toLowerCase())
      );
    }

    if (localFilters.length > 0) {
      filteredResults = filteredResults.filter((post: Post) =>
        localFilters.every((filter: LocalFilter) => {
          const filterValue = filter.value;
          const postValue = (post.article.characteristics as any)[filter.field];
          return Array.isArray(filterValue)
            ? filterValue.includes(postValue)
            : postValue === filterValue;
        })
      );
    }

    return filteredResults;
  }

  private sortResults({
    results,
    order,
  }: {
    results: Post[];
    order: { field: keyof PostModel; direction: 'asc' | 'desc' };
  }): Post[] {
    return results.sort((a: PostModel, b: PostModel) => {
      const aValue = a[order.field] ?? 0;
      const bValue = b[order.field] ?? 0;
      if (aValue < bValue) return order.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return order.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private buildConstraintFilters(generalFilters: GeneralFilter[]): FirestoreFilter[] {
    if (!Object.keys(generalFilters).length) return [];

    const filters: FirestoreFilter[] = generalFilters.map((filter) => {
      const { field, value } = filter;
      if (field === 'category') return { field: 'article.category', operator: '==', value };
      if (field === 'priceMin') return { field: 'price', operator: '>=', value };
      if (field === 'priceMax') return { field: 'price', operator: '<=', value };
      if (field === 'condition') {
        return { or: value.map((v: any) => ({ field: 'article.condition', operator: '==', value: v })) };
      }
      return { field, operator: '==', value };
    });

    return filters.length > 1 ? [{ and: filters }] : filters;
  }
}
