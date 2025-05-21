import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { conversationsListResolver } from './conversations-list.resolver';

describe('conversationsListResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => conversationsListResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
