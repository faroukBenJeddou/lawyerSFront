import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerClientsComponent } from './lawyer-clients.component';

describe('LawyerClientsComponent', () => {
  let component: LawyerClientsComponent;
  let fixture: ComponentFixture<LawyerClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
