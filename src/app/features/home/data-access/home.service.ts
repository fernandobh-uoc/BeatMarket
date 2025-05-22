import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ArticleCategory } from 'src/app/core/domain/models/article.model';
import { Post } from 'src/app/core/domain/models/post.model';
import { Role } from 'src/app/core/domain/models/user.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

type HomeState = {
  latestPosts: Post[];
  recommendedPosts: Post[];
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private authService = inject(AuthService);
  private postRepository = inject(PostRepository);

  private userRoles = computed(() => this.authService.currentUser()?.roles ?? []);

  private latestPosts = resource<Post[], string>({
    request: () => this.authService.currentUser()?._id ?? '',
    loader: async ({ request: userId }): Promise<Post[]> => {
      if (!userId) return [];
      try {
        const posts = await this.postRepository.queryPosts({
          filters: [
            {
              field: 'user.userId',
              operator: '!=',
              value: userId
            },
            {
              field: 'isActive',
              operator: '==',
              value: true
            }
          ],
          orderBy: {
            field: 'createdAt',
            direction: 'desc'
          },
          limit: 10
        });
        return posts ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  });

  private recommendedPosts = resource<Post[], string>({
    request: () => this.authService.currentUser()?._id ?? '',
    loader: async ({ request: userId }): Promise<Post[]> => {
      if (!userId) return [];
      try {
        let queryConstraints: Record<string, any> = {};
        let roleFilters = new Set<string>();

        const categories = Object.values(ArticleCategory).filter(category => category !== ArticleCategory.None);

        if (this.userRoles().includes(Role.Amateur)) {
          [...categories.filter(category => category !== ArticleCategory.Professional)].forEach(category => roleFilters.add(category)); // Exclude "Professional" category
        }
        if (this.userRoles().includes(Role.Professional)) {
          [...categories.filter(category => category !== ArticleCategory.Recordings)].forEach(category => roleFilters.add(category)); // Exclude "Recordings" category
        }
        if (this.userRoles().includes(Role.Collector)) {
          roleFilters.add(ArticleCategory.Recordings);
          roleFilters.add(ArticleCategory.Other);
        }
        if (this.userRoles().includes(Role.Student)) {
          roleFilters.add(ArticleCategory.Instruments);
          roleFilters.add(ArticleCategory.Accessories);
          roleFilters.add(ArticleCategory.Books);
        }

        if (roleFilters.size > 0) {
          queryConstraints['filters'] = [
            {
              and: [
                {
                  field: 'user.userId',
                  operator: '!=',
                  value: this.authService.currentUser()?._id
                },
                {
                  or: Array.from(roleFilters).map(category => ({
                    field: 'article.category',
                    operator: '==',
                    value: category
                  }))
                }
              ]
            },

          ];
        }

        queryConstraints['limit'] = 10;

        const posts = await this.postRepository.queryPosts(queryConstraints);

        //this.#cachedLatestPosts = posts;
        return posts ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  })

  private errorMessage = signal<string>('');

  homeState = computed<HomeState>(() => ({
    latestPosts: this.latestPosts.value() ?? [],
    recommendedPosts: this.recommendedPosts.value() ?? [],
    loading: this.latestPosts.isLoading() || this.recommendedPosts.isLoading(),
    errorMessage: this.errorMessage()
  }))

  constructor() { }

  reloadResources() {
    this.latestPosts.reload();
    this.recommendedPosts.reload();
  }

  /* async getLatestPosts({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Promise<Post[] | null> {
    //if (this.#cachedLatestPosts) return this.#cachedLatestPosts;
    const posts = await this.postRepository.queryPosts({
      filters: [
        {
          field: 'user.userId',
          operator: '!=',
          value: this.authService.currentUser()?._id
        },
        {
          field: 'isActive',
          operator: '==',
          value: true
        }
      ],
      orderBy: {
        field: orderBy ? orderBy.field : 'createdAt',
        direction: orderBy ? orderBy.direction : 'desc',
      },
      limit: limit ?? undefined,
    });
    //this.#cachedLatestPosts = posts;
    return posts;
  }

  getLatestPosts$({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Observable<Post[] | null> | null {
    return null;
  }

  async getRecommendedPosts({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Promise<Post[] | null> {
    //if (this.#cachedRecommendedPosts) return this.#cachedRecommendedPosts;

    let queryConstraints: Record<string, any> = {};
    let roleFilters = new Set<string>();

    const categories = Object.values(ArticleCategory).filter(category => category !== ArticleCategory.None);

    if (this.userRoles().includes(Role.Amateur)) {
      [...categories.filter(category => category !== ArticleCategory.Professional)].forEach(category => roleFilters.add(category)); // Exclude "Professional" category
    }
    if (this.userRoles().includes(Role.Professional)) {
      [...categories.filter(category => category !== ArticleCategory.Recordings)].forEach(category => roleFilters.add(category)); // Exclude "Recordings" category
    }
    if (this.userRoles().includes(Role.Collector)) {
      roleFilters.add(ArticleCategory.Recordings);
      roleFilters.add(ArticleCategory.Other);
    }
    if (this.userRoles().includes(Role.Student)) {
      roleFilters.add(ArticleCategory.Instruments);
      roleFilters.add(ArticleCategory.Accessories);
      roleFilters.add(ArticleCategory.Books);
    }

    if (roleFilters.size > 0) {
      queryConstraints['filters'] = [
        {
          and: [
            {
              field: 'user.userId',
              operator: '!=',
              value: this.authService.currentUser()?._id
            },
            {
              or: Array.from(roleFilters).map(category => ({
                field: 'article.category',
                operator: '==',
                value: category
              }))
            }
          ]
        },

      ];
    }

    if (orderBy) {
      queryConstraints['orderBy'] = {
        field: orderBy.field,
        direction: orderBy.direction
      };
    }

    if (limit) {
      queryConstraints['limit'] = limit;
    }

    // Query the posts from Firestore
    const posts = await this.postRepository.queryPosts(queryConstraints);

    //this.#cachedLatestPosts = posts;
    return posts;
  } */
}
