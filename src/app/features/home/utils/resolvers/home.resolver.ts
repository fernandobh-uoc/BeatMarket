import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HomeService } from '../../data-access/home.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';

// UNUSED

export const latestPostsResolver: ResolveFn<Promise<Post[]>> = async (route, state) => {
  const homeService = inject(HomeService);
  const postRepository = inject(PostRepository);
  
  return [];
};

export const recommendedPostsResolver: ResolveFn<Promise<Post[]>> = async (route, state) => {
  const homeService = inject(HomeService);
  return [];
};
