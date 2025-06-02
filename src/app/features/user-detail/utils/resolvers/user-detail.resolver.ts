import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserDetailService } from '../../data-access/user-detail.service';
import { User } from 'src/app/core/domain/models/user.model';
import { catchError, Observable, of, throwError } from 'rxjs';

//UNUSED

export const userDetailResolver: ResolveFn<User | null> = async (route, state) => {
  return null;
};

export const userDetailResolver$: ResolveFn<Observable<User | null> | null> = async (route, state) => {
  return null;
};
