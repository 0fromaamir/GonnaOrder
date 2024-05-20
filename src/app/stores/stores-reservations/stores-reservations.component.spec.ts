import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoresReservationsComponent } from './stores-reservations.component';

describe('StoresReservationsComponent', () => {
  let component: StoresReservationsComponent;
  let fixture: ComponentFixture<StoresReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoresReservationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoresReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
