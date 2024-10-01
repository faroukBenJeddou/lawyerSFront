import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientConsultationComponent } from './client-consultation.component';

describe('ClientConsultationComponent', () => {
  let component: ClientConsultationComponent;
  let fixture: ComponentFixture<ClientConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
