import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PostDetailService } from '../../data-access/post-detail.service';

// UNUSED
export const postDetailResolver: ResolveFn<boolean> = async (route, state) => {
  const postDetailService = inject(PostDetailService);
  const postId = route.paramMap.get('postId');
  if (!postId) return false;

  postDetailService.setPostId(postId);
  return true;
};
