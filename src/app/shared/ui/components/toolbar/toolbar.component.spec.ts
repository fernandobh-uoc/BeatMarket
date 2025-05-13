import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CartService } from 'src/app/features/cart/data-access/cart.service';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular'

// Mock NavController
class MockNavController {
  back = jasmine.createSpy('back');
}

// Mock CartService
class MockCartService {
  cartItemsAmount = signal<number>(2); // simulate 2 items in cart
  cart = signal(null);
}

// Mock Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ToolbarComponent], // standalone component
      providers: [
        { provide: CartService, useClass: MockCartService },
        { provide: Router, useClass: MockRouter },
        { provide: NavController, useClass: MockNavController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('should display cart badge when items exist', () => {
    const badge = fixture.debugElement.query(By.css('ion-badge'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent.trim()).toBe('2');
  });

  it('should open the search bar on button click', () => {
    component.searchActive.set(false);
    fixture.detectChanges();

    const searchBtn = fixture.debugElement.query(By.css('ion-button'));
    searchBtn.triggerEventHandler('click');
    fixture.detectChanges();

    expect(component.searchActive()).toBeTrue();
  });

  it('should navigate on valid search submission', () => {
    component.searchQuery.set('guitar');
    component.submitSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/tabs/search'], {
      queryParams: { query: 'guitar' }
    });
  });

  it('should NOT navigate on empty search', () => {
    component.searchQuery.set('   ');
    component.submitSearch();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
