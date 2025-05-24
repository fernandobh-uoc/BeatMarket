import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserDetailService } from '../../data-access/user-detail.service';
import { User } from 'src/app/core/domain/models/user.model';
import { catchError, Observable, of, throwError } from 'rxjs';

//UNUSED

export const userDetailResolver: ResolveFn<User | null> = async (route, state) => {
  return null;
  /* const userDetailService = inject(UserDetailService);
  const userId = route.paramMap.get('userId');

  return await userDetailService.getUserData(userId ?? ''); */
};

export const userDetailResolver$: ResolveFn<Observable<User | null> | null> = async (route, state) => {
  return null;
  /* const userDetailService = inject(UserDetailService);
  const userId = route.paramMap.get('userId');

  return (await userDetailService.getUserData$(userId ?? '') ?? of(null)).pipe(
    catchError(error => {
      console.error(error);
      return throwError(() => new Error('Error fetching user data'));
    })
  ); */
};
