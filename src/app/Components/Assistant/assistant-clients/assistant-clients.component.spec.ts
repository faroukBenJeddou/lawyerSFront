import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantClientsComponent } from './assistant-clients.component';

describe('AssistantClientsComponent', () => {
  let component: AssistantClientsComponent;
  let fixture: ComponentFixture<AssistantClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
