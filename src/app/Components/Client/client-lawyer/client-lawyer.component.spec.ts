import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLawyerComponent } from './client-lawyer.component';

describe('ClientLawyerComponent', () => {
  let component: ClientLawyerComponent;
  let fixture: ComponentFixture<ClientLawyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLawyerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientLawyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
