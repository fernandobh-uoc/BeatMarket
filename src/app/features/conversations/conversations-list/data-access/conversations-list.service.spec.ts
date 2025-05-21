import { TestBed } from '@angular/core/testing';

import { ConversationsListService } from './conversations-list.service';

describe('ConversationsListService', () => {
  let service: ConversationsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
