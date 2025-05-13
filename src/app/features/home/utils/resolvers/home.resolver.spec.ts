import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { latestPostsResolver } from './home.resolver';
import { Post } from 'src/app/core/domain/models/post.model';

describe('homeResolver', () => {
  const executeResolver: ResolveFn<Post[]> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => {
        const result = latestPostsResolver(...resolverParameters);
        if (result && typeof (result as any).subscribe === 'function') {
          // result is Observable<Promise<Post[]> | RedirectCommand>
          return (result as any).pipe(
            // Import switchMap and of from rxjs if not already imported
            require('rxjs').switchMap((value: any) => {
              if (value instanceof Promise) {
                return require('rxjs').from(value);
              }
              return require('rxjs').of(value);
            })
          );
        }
        return result;
      });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
