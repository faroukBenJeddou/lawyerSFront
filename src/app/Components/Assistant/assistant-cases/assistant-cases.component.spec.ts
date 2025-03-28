import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCasesComponent } from './assistant-cases.component';

describe('AssistantCasesComponent', () => {
  let component: AssistantCasesComponent;
  let fixture: ComponentFixture<AssistantCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantCasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
