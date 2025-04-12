import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantEditProfileComponent } from './assistant-edit-profile.component';

describe('AssistantEditProfileComponent', () => {
  let component: AssistantEditProfileComponent;
  let fixture: ComponentFixture<AssistantEditProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantEditProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
