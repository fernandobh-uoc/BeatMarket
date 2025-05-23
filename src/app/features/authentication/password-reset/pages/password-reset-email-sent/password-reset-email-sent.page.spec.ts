import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetEmailSentPage } from './password-reset-email-sent.page';

describe('PasswordResetEmailSentPage', () => {
  let component: PasswordResetEmailSentPage;
  let fixture: ComponentFixture<PasswordResetEmailSentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetEmailSentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
