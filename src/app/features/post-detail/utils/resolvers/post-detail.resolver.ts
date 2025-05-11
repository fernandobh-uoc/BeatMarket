import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PostDetailService } from '../../data-access/post-detail.service';
import { Post } from 'src/app/core/domain/models/post.model';

export const postDetailResolver: ResolveFn<Post | null> = async (route, state) => {
  const postDetailService = inject(PostDetailService);
  const postId = route.paramMap.get('postId');

  return await postDetailService.getPostData(postId);
};
