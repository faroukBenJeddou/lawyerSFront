import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileLawyerComponent } from './edit-profile-lawyer.component';

describe('EditProfileLawyerComponent', () => {
  let component: EditProfileLawyerComponent;
  let fixture: ComponentFixture<EditProfileLawyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileLawyerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileLawyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
