import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSideBarNavbarComponent } from './client-side-bar-navbar.component';

describe('ClientSideBarNavbarComponent', () => {
  let component: ClientSideBarNavbarComponent;
  let fixture: ComponentFixture<ClientSideBarNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSideBarNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSideBarNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
