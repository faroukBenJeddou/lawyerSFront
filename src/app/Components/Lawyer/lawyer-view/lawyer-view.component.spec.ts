import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerViewComponent } from './lawyer-view.component';

describe('LawyerViewComponent', () => {
  let component: LawyerViewComponent;
  let fixture: ComponentFixture<LawyerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
