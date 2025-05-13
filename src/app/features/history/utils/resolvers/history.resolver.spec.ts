import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { historyResolver } from './history.resolver';

describe('historyResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => historyResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
