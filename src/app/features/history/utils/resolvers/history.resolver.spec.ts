import { TestBed } from '@angular/core/testing';
import { RedirectCommand, ResolveFn } from '@angular/router';

import { boughtItemsResolver } from './history.resolver';
import { Sale } from 'src/app/core/domain/models/sale.model';

describe('boughtItemsResolver', () => {
  const executeResolver: ResolveFn<Sale[] | RedirectCommand | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => boughtItemsResolver(...resolverParameters));  

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
