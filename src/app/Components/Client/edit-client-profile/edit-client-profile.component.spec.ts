import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClientProfileComponent } from './edit-client-profile.component';

describe('EditClientProfileComponent', () => {
  let component: EditClientProfileComponent;
  let fixture: ComponentFixture<EditClientProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClientProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditClientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
