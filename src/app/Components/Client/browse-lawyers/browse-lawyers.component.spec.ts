import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseLawyersComponent } from './browse-lawyers.component';

describe('BrowseLawyersComponent', () => {
  let component: BrowseLawyersComponent;
  let fixture: ComponentFixture<BrowseLawyersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseLawyersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseLawyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
