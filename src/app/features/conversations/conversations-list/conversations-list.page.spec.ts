import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversationsListPage } from './conversations-list.page';

describe('ConversationsListPage', () => {
  let component: ConversationsListPage;
  let fixture: ComponentFixture<ConversationsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
