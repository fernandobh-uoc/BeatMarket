import { TestBed } from '@angular/core/testing';

import { UserDataItemEditService } from './user-data-item-edit.service';

describe('UserDataItemEditService', () => {
  let service: UserDataItemEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDataItemEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
