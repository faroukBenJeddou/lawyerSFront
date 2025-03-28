import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantViewComponent } from './assistant-view.component';

describe('AssistantViewComponent', () => {
  let component: AssistantViewComponent;
  let fixture: ComponentFixture<AssistantViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
