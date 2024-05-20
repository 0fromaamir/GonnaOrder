import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationTabsComponent } from './reservation-tabs.component';

describe('ReservationTabsComponent', () => {
  let component: ReservationTabsComponent;
  let fixture: ComponentFixture<ReservationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
