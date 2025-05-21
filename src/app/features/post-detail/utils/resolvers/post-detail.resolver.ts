import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PostDetailService } from '../../data-access/post-detail.service';
import { Post } from 'src/app/core/domain/models/post.model';
import { Observable } from 'rxjs';

export const postDetailResolver: ResolveFn<boolean> = async (route, state) => {
  const postDetailService = inject(PostDetailService);
  const postId = route.paramMap.get('postId');
  if (!postId) return false;

  postDetailService.setPostId(postId);
  return true;
  //return await postDetailService.getPostData(postId);
};

/* export const postDetailResolver$: ResolveFn<Observable<Post | null> | null> = (route, state) => {
  const postDetailService = inject(PostDetailService);
  const postId = route.paramMap.get('postId');

  return postDetailService.getPostData$(postId);
}; */
