import { Component, OnDestroy, OnInit } from '@angular/core';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import {ConnectGlobalPay, ConnectJCC, DisConnectGlobalPay} from '../+state/payment.actions';

@Component({
  selector: 'app-store-payment-globalpay',
  templateUrl: './store-payment-globalpay.component.html',
  styleUrls: ['./store-payment-globalpay.component.scss']
})
export class StorePaymentGlobalpayComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public globalPayForm: FormGroup;
  public globalPayEnabled: boolean;
  public globalPayConnected: boolean;
  public globalPayMerchantId: boolean;
  helpUrl: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.helpUrl = 'globalpay';
    this.globalPayForm = this.fb.group({
      GLOBAL_PAY_MERCHANT_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      GLOBAL_PAY_SHARED_SECRET: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      GLOBAL_PAY_ACCOUNT_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
        if (s.settings.GLOBAL_PAY_MERCHANT_ID && s.settings.GLOBAL_PAY_SHARED_SECRET && s.settings.GLOBAL_PAY_ACCOUNT_ID) {
          this.globalPayForm.patchValue(s.settings, {emitEvent: false});
          this.globalPayConnected = true;
          this.globalPayMerchantId = s.settings.GLOBAL_PAY_MERCHANT_ID;
          this.globalPayEnabled = s.settings.PAYMENT_GLOBAL_PAY_CREDIT_CARD_ENABLED;
        } else {
          this.globalPayConnected = false;
          this.globalPayMerchantId = false;
          this.globalPayEnabled = false;
        }
    });

    // tslint:disable
    this.globalPayForm.valueChanges.subscribe(v => {
      if (!v.GLOBAL_PAY_SHARED_SECRET.trim() &&
          !v.GLOBAL_PAY_MERCHANT_ID.trim() &&
          !v.GLOBAL_PAY_ACCOUNT_ID.trim() &&
          !this.globalPayConnected
          ) {
          this.globalPayEnabled = false;
          this.toggleGlobalPayPayments(false);
      }
    });
    // tslint:enable
  }

  onGlobalPayClicked() {
    this.showFields = true;
  }

  connect(){
    this.globalPayForm.markAllAsTouched();
    const formData = this.globalPayForm.getRawValue();
    if (
      this.globalPayForm.valid &&
      formData.GLOBAL_PAY_MERCHANT_ID.trim() &&
      formData.GLOBAL_PAY_SHARED_SECRET.trim() &&
      formData.GLOBAL_PAY_ACCOUNT_ID.trim()
    ) {
      this.store.dispatch(new ConnectGlobalPay({
        merchantId: formData.GLOBAL_PAY_MERCHANT_ID,
        sharedSecret: formData.GLOBAL_PAY_SHARED_SECRET,
        accountId: formData.GLOBAL_PAY_ACCOUNT_ID,
      }));
    }
  }

  // tslint:disable
  disconnect() {
    this.store.dispatch(new DisConnectGlobalPay());
  }
  // tslint:enable


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.globalPayForm.get(name);
  }

  toggleGlobalPayPayments(e) {
    if (this.globalPayForm.controls.GLOBAL_PAY_SHARED_SECRET.value.trim().length === 0
        && this.globalPayForm.controls.GLOBAL_PAY_MERCHANT_ID.value.trim().length === 0
        && this.globalPayForm.controls.GLOBAL_PAY_ACCOUNT_ID.value.trim().length === 0
        && e) {
      setTimeout(() => {
          this.globalPayEnabled = false;
      });
      return;
    }
    if (this.globalPayForm.valid) {
        const formData = this.globalPayForm.getRawValue();
        this.store.dispatch(new UpdateStoreSettings({PAYMENT_GLOBAL_PAY_CREDIT_CARD_ENABLED: e, ...formData}));
    } else {
        setTimeout(() => {
            this.globalPayEnabled = false;
        });

    }
  }
}
