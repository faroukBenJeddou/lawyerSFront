import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantConsultationsComponent } from './assistant-consultations.component';

describe('AssistantConsultationsComponent', () => {
  let component: AssistantConsultationsComponent;
  let fixture: ComponentFixture<AssistantConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantConsultationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantConsultationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
