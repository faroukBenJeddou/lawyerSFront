import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCaseDetailsComponent } from './assistant-case-details.component';

describe('AssistantCaseDetailsComponent', () => {
  let component: AssistantCaseDetailsComponent;
  let fixture: ComponentFixture<AssistantCaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantCaseDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantCaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
