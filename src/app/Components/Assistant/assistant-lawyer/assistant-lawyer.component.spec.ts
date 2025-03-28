import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantLawyerComponent } from './assistant-lawyer.component';

describe('AssistantLawyerComponent', () => {
  let component: AssistantLawyerComponent;
  let fixture: ComponentFixture<AssistantLawyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantLawyerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantLawyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
