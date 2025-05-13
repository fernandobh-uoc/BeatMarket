import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomePage } from './home.page';
import { ActivatedRoute } from '@angular/router';
import { Component, Input } from '@angular/core';
import { Post } from 'src/app/core/domain/models/post.model';
import { By } from '@angular/platform-browser';

// Stub for PostCardsRowComponent
@Component({
  selector: 'app-post-cards-row',
  template: '<div class="post-cards-row-stub">{{ posts?.length }}</div>'
})
class MockPostCardsRowComponent {
  @Input() posts: Post[] | null = [];
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const mockLatestPosts: Post[] = [
    { _id: '1', title: 'Post 1', isActive: true, user: { userId: 'user1' } } as Post,
    { _id: '2', title: 'Post 2', isActive: true, user: { userId: 'user2' } } as Post,
  ];

  const mockRecommendedPosts: Post[] = [
    { _id: '3', title: 'Post 3', isActive: true, user: { userId: 'user3' } } as Post
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      declarations: [MockPostCardsRowComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                latestPosts: mockLatestPosts,
                recommendedPosts: mockRecommendedPosts,
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  it('should load and display latest and recommended posts', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit
    component.ionViewDidEnter(); // manually trigger lifecycle method
    tick(); // simulate async resolution

    fixture.detectChanges(); // update view

    const postCardComponents = fixture.debugElement.queryAll(By.css('.post-cards-row-stub'));
    expect(postCardComponents.length).toBe(2);

    const latestRowText = postCardComponents[0].nativeElement.textContent;
    const recommendedRowText = postCardComponents[1].nativeElement.textContent;

    expect(latestRowText).toContain('2'); // 2 latest posts
    expect(recommendedRowText).toContain('1'); // 1 recommended post
  }));
});