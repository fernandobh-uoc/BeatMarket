import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { postDetailResolver } from './post-detail.resolver';

describe('postDetailResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => postDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
