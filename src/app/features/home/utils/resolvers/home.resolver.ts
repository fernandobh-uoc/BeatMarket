import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HomeService } from '../../data-access/home.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { Observable } from 'rxjs';

export const latestPostsResolver: ResolveFn<Promise<Post[]>> = async (route, state) => {
  const homeService = inject(HomeService);
  return await homeService.getLatestPosts({ limit: 10, orderBy: { field: 'createdAt', direction: 'desc' } }) ?? [];
};

export const recommendedPostsResolver: ResolveFn<Promise<Post[]>> = async (route, state) => {
  const homeService = inject(HomeService);
  return await homeService.getRecommendedPosts({ limit: 10 }) ?? [];
};
