import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublishPage } from './publish.page';

describe('SellPage', () => {
  let component: PublishPage;
  let fixture: ComponentFixture<PublishPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
