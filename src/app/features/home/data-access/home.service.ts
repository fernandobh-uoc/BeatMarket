import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ArticleCategory } from 'src/app/core/domain/models/article.model';
import { Post } from 'src/app/core/domain/models/post.model';
import { Role } from 'src/app/core/domain/models/user.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  authService = inject(AuthService);
  postRepository = inject(PostRepository);

  userRoles = computed(() => this.authService.currentUser()?.roles ?? []);

  #cachedLatestPosts: Post[] | null = null;
  #cachedRecommendedPosts: Post[] | null = null;

  constructor() { }

  async getLatestPosts({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Promise<Post[] | null> {
    if (this.#cachedLatestPosts) return this.#cachedLatestPosts;
    const posts = await this.postRepository.queryPosts({
      orderBy: {
        field: orderBy ? orderBy.field : 'createdAt',
        direction: orderBy ? orderBy.direction : 'desc',
      },
      limit: limit ?? undefined,
    });
    this.#cachedLatestPosts = posts;
    return posts;
  }

  getLatestPosts$({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Observable<Post[] | null> | null {
    return null;
  }

  async getRecommendedPosts({ orderBy, limit }: { orderBy?: { field: string, direction?: 'asc' | 'desc' }, limit?: number }): Promise<Post[] | null> {
    if (this.#cachedRecommendedPosts) return this.#cachedRecommendedPosts;
    
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
          or: Array.from(roleFilters).map(category => ({
                field: 'article.category',
                operator: '==',
                value: category
              }))
        }
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

    this.#cachedLatestPosts = posts;
    return posts;
  }
}
