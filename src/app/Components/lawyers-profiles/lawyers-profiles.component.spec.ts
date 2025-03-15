import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyersProfilesComponent } from './lawyers-profiles.component';

describe('LawyersProfilesComponent', () => {
  let component: LawyersProfilesComponent;
  let fixture: ComponentFixture<LawyersProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyersProfilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyersProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
