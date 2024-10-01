import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseDetailsClientComponent } from './case-details-client.component';

describe('CaseDetailsClientComponent', () => {
  let component: CaseDetailsClientComponent;
  let fixture: ComponentFixture<CaseDetailsClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseDetailsClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseDetailsClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
