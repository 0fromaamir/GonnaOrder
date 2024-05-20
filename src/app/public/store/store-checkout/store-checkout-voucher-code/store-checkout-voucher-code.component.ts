import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AddCheckoutState, AddOrderMeta, UpdateVoucher } from '../../+state/stores.actions';
import { Cart } from '../../+state/stores.reducer';
import { getCheckoutState, getCurrentCartState, getCurrentOrderMetaState } from '../../+state/stores.selectors';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-store-checkout-voucher-code',
  templateUrl: './store-checkout-voucher-code.component.html',
  styleUrls: ['./store-checkout-voucher-code.component.scss']
})
export class StoreCheckoutVoucherCodeComponent implements OnInit, OnDestroy {

  voucherCodeFg: FormGroup;
  destroy$: Subject<void> = new Subject<void>();
  voucherCodeInitialValue: string;
  voucherCodeInvalid = false;
  voucherCodeValid = false;
  remainingVoucherAmount = 0;
  voucherUseType: string;
  voucherDiscountType: string;
  voucherOrderMinAmount: number;
  voucherFormattedOrderMinAmount: string;
  totalNonDiscountedPrice: number;
  constructor(  private fb: FormBuilder
              , private store: Store<Cart>
              , public checkoutService: CheckoutService
             ) { }

  ngOnInit() {

    // get order meta data
    this.store.select(getCurrentOrderMetaState)
      .pipe(takeUntil(this.destroy$))
      .subscribe(d => {
      this.voucherCodeInitialValue = d.data.voucherCode;
      if (this.voucherCodeFg) {
        if (d.data.voucherCode) {
          this.voucherCodeFg.patchValue({voucherCode: d.data.voucherCode || ''});
        }
      }
    });

    this.store.select(getCurrentCartState)
      .pipe(takeUntil(this.destroy$))
      .subscribe(d => {
      const voucher = this.getControl('voucherCode')?.value;
      this.store.dispatch(new AddOrderMeta('voucherCode', voucher, {
        src: 'StoreCheckoutVoucherCodeComponent',
        description: 'Cart state updated'
      }));
      // Update voucherCode when an Invalid voucher code exists
      if (!d.voucherCode && voucher && d.voucherCode !== voucher) {
        this.store.dispatch(new UpdateVoucher(voucher, this.checkoutService.orderUuid));
        this.store.dispatch(new AddCheckoutState('voucherFormValid', false));
      }
    });
    combineLatest([
      this.store.select(getCheckoutState),
      this.store.select(getCurrentCartState)
    ]).pipe(
      takeUntil(this.destroy$),
      filter(([checkout]) => !!checkout)
    ).subscribe(([checkout, cart]) => {
        this.totalNonDiscountedPrice = cart.totalNonDiscountedPrice;
        this.voucherCodeInvalid = checkout.checkoutState.data.voucherValidation === false;
        this.voucherCodeValid = checkout.checkoutState.data.voucherValidation === true;
        if (this.voucherCodeValid) {
          this.voucherUseType = checkout.checkoutState.data.voucherUseType;
          this.voucherDiscountType = checkout.checkoutState.data.voucherDiscountType;
          this.remainingVoucherAmount = checkout.checkoutState.data.voucherDiscount;
          this.voucherOrderMinAmount = checkout.checkoutState.data.voucherOrderMinAmount;
          this.voucherFormattedOrderMinAmount = checkout.checkoutState.data.voucherFormattedOrderMinAmount;
        }
      });

    // set form validation rules:
    this.voucherCodeFg = this.fb.group({
      voucherCode: [this.voucherCodeInitialValue ? this.voucherCodeInitialValue : '',
        Validators.compose([Validators.maxLength(20)])]
    });

    this.getControl('voucherCode').valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      () => {
        this.voucherCodeInvalid = false;
        this.voucherCodeValid = false;
        this.voucherOrderMinAmount = null;
        this.voucherFormattedOrderMinAmount = null;
      });

  }

  getControl(name: string, form: string = 'voucherCodeFg') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  applyVoucher(event) {
    event.preventDefault();
    const voucherCode = this.getControl('voucherCode').value;
    this.store.dispatch(new AddOrderMeta('voucherCode', voucherCode, {
      src: 'StoreCheckoutVoucherCodeComponent',
      description: 'Voucher code applied'
    }));
    this.store.dispatch(new UpdateVoucher(voucherCode, this.checkoutService.orderUuid));

  }

  orderMinRequired(): boolean {
    return this.voucherOrderMinAmount
              && this.totalNonDiscountedPrice
              && this.totalNonDiscountedPrice < this.voucherOrderMinAmount;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
