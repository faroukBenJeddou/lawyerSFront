import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantSideBarNavbarComponent } from './assistant-side-bar-navbar.component';

describe('AssistantSideBarNavbarComponent', () => {
  let component: AssistantSideBarNavbarComponent;
  let fixture: ComponentFixture<AssistantSideBarNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantSideBarNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantSideBarNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
