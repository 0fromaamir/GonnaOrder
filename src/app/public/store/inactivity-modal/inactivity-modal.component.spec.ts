import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivityModalComponent } from './inactivity-modal.component';

describe('InactivityModalComponent', () => {
  let component: InactivityModalComponent;
  let fixture: ComponentFixture<InactivityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivityModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactivityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
