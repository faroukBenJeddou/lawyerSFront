import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCaseComponent } from './client-case.component';

describe('ClientCaseComponent', () => {
  let component: ClientCaseComponent;
  let fixture: ComponentFixture<ClientCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
