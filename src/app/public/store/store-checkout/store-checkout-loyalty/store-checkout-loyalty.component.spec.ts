import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCheckoutLoyaltyComponent } from './store-checkout-loyalty.component';

describe('StoreCheckoutLoyaltyComponent', () => {
  let component: StoreCheckoutLoyaltyComponent;
  let fixture: ComponentFixture<StoreCheckoutLoyaltyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreCheckoutLoyaltyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreCheckoutLoyaltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
