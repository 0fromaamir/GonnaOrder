import { TogglePaypal } from './../+state/payment.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { Subject } from 'rxjs';
import { getSelectedStore } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-payment-paypal',
  templateUrl: './store-payment-paypal.component.html',
  styleUrls: ['./store-payment-paypal.component.scss']
})
export class StorePaymentPaypalComponent implements OnInit, OnDestroy {

  paypalForm: FormGroup;
  paymentFlag: any;
  paypalId: any;
  unsubscribe$: Subject<void> = new Subject<void>();
  paypalMessage: string;
  http: any;
  https: any;
  payPalme: any;
  helpUrlPaypal: string;
  showFields: boolean;
  paypalConnected: boolean;
  payPalmelink: boolean;

  constructor(private store: Store<StoresState>, private fb: FormBuilder, private route: ActivatedRoute) {
    this.helpUrlPaypal = 'paypal';
    this.payPalme = 'https://paypal.me/';
  }

  ngOnInit() {
    this.paypalForm = this.fb.group({
      POST_ORDER_PAYMENT_LINK_PAYPALME_URL: [this.payPalme, Validators.compose([Validators.maxLength(200)])],
      POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED: ['']
    });
    this.store.select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
        this.paypalForm.patchValue(s.settings);
        this.paymentFlag = s.settings.PAYMENT_PAYPAL_ENABLED;
        this.paypalId = s.settings.PAYPAL_MERCHANT_ID;
        if (s.settings.POST_ORDER_PAYMENT_LINK_PAYPALME_URL) {
          this.payPalmelink = s.settings.POST_ORDER_PAYMENT_LINK_PAYPALME_URL;
          this.paypalConnected = true;
        } else {
          this.payPalmelink = false;
          this.paypalConnected = false;
        }
      });

    this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_URL').valueChanges.subscribe(v => {
      if (this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_PAYPALME_URL.value !== this.https &&
        !this.paypalConnected
      ) {
      } else {
        this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_PAYPALME_URL.setErrors(null);
      }
    });

  }

  onpaypalClicked() {
    this.showFields = true;
  }

  togglePaypalPayments(e) {
    this.store.dispatch(new TogglePaypal(e.target.checked as boolean));
  }

  checkPredefault(input) {
    const field = input.target;
    this.togglePaypalMe(input.target.value);
    if (field.value.indexOf(this.payPalme) === -1 && field.value.indexOf(this.payPalme) === -1) {
      input.target.value = this.payPalme;
      this.togglePaypalMe(input.target.value);
    }
  }

  togglePaypalMe(inputText) {
    if (inputText.length > this.payPalme.length) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(true);
    } else {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(false);
    }
  }

  togglePaypalMeSwitch(input) {

          this.paypalForm.patchValue({
            POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED: input.target.checked,
          });
          this.store.dispatch(
            new UpdateStoreSettings(this.paypalForm.getRawValue())
          );
  }

  checkPredefaultPaymentLink(input) {
    const field = input.target;
    this.togglePaymentLink(input.target.value);
    if (field.value.indexOf(this.payPalme) === -1 &&
      field.value.indexOf(this.payPalme) === -1) {
      input.target.value = this.payPalme;
      this.togglePaymentLink(input.target.value);
    }
  }

  togglePaymentLink(inputText) {
    if (inputText !== (this.payPalme)) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(true);
    } else {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(false);
    }
  }

  getControl(name: string) {
    return this.paypalForm.get(name);
  }

  connect() {
    if (this.paypalForm.valid) {
      const formData = this.paypalForm.getRawValue();
      if (formData.POST_ORDER_PAYMENT_LINK_PAYPALME_URL.length < this.payPalme.length) {
        formData.POST_ORDER_PAYMENT_LINK_PAYPALME_URL = this.payPalme;
      }
      this.store.dispatch(new UpdateStoreSettings(formData));
    }

  }

  disconnect() {
    const form = {
      POST_ORDER_PAYMENT_LINK_PAYPALME_URL: null,
      POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED: null
    };
    this.store.dispatch(new UpdateStoreSettings(form));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
