import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerSideBarNavbarComponent } from './lawyer-side-bar-navbar.component';

describe('LawyerSideBarNavbarComponent', () => {
  let component: LawyerSideBarNavbarComponent;
  let fixture: ComponentFixture<LawyerSideBarNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerSideBarNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerSideBarNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
