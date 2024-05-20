import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookUpdateReservationsComponent } from './book-update-reservations.component';

describe('BookUpdateReservationsComponent', () => {
  let component: BookUpdateReservationsComponent;
  let fixture: ComponentFixture<BookUpdateReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookUpdateReservationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookUpdateReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
