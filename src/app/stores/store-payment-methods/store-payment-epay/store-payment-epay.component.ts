import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { StoresState } from "../../+state/stores.reducer";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { getSelectedStore } from "../../+state/stores.selectors";
import { filter, takeUntil } from "rxjs/operators";
import { UpdateStoreSettings } from "../../+state/stores.actions";
import { ConnectEpay, DisConnectEpay } from "../+state/payment.actions";

@Component({
  selector: 'app-store-payment-epay',
  templateUrl: './store-payment-epay.component.html',
  styleUrls: ['./store-payment-epay.component.scss']
})
export class StorePaymentEpayComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();
  helpUrl: string;
  public showFields: boolean;
  public epayForm: FormGroup;
  public epayEnabled: boolean;
  public epayConnected: boolean;
  public epayMerchantId: string;
  public epayPosId: string;
  public epayUsername: string;
  public epayPassword: string;
  public epayPaymentType: string;
  public epayTerminalId: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.helpUrl = 'epay';
    this.epayForm = this.fb.group({
      EPAY_MERCHANT_ID: ['', [Validators.required, Validators.maxLength(255), this.noWhitespace]],
      EPAY_USERNAME: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      EPAY_PASSWORD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      EPAY_PAYMENT_TYPE: ['ONLINE', Validators.compose([Validators.required, Validators.maxLength(100)])],
      EPAY_POS_ID: ['', Validators.compose([Validators.maxLength(100)])],
      EPAY_TERMINAL_ID: ['', Validators.compose([Validators.maxLength(100)])],
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.EPAY_MERCHANT_ID && (s.settings.EPAY_POS_ID || s.settings.EPAY_TERMINAL_ID) && s.settings.EPAY_USERNAME && s.settings.EPAY_PASSWORD) {
        this.epayForm.patchValue(s.settings, { emitEvent: false });
        this.epayConnected = true;
        this.epayEnabled = s.settings.PAYMENT_EPAY_CREDIT_CARD_ENABLED;
        this.epayMerchantId = s.settings.EPAY_MERCHANT_ID;
        this.epayPosId = s.settings.EPAY_POS_ID;
        this.epayUsername = s.settings.EPAY_USERNAME;
        this.epayPassword = s.settings.EPAY_PASSWORD;
        this.epayPaymentType = s.settings.EPAY_PAYMENT_TYPE;
        this.epayTerminalId = s.settings.EPAY_TERMINAL_ID;
      } else {
        this.epayConnected = false;
        this.epayEnabled = false;
        this.epayMerchantId = ''
        this.epayPosId = '';
        this.epayUsername = '';
        this.epayPassword = '';
        this.epayPaymentType = 'ONLINE';
      }
    });

    // tslint:disable
    this.epayForm.valueChanges.subscribe(v => {
      if (!v.EPAY_MERCHANT_ID.trim() &&
        (!v.EPAY_POS_ID.trim() || !v.EPAY_TERMINAL_ID.trim()) &&
        !v.EPAY_USERNAME.trim() &&
        !v.EPAY_PASSWORD.trim() &&
        !this.epayConnected
      ) {
        this.epayEnabled = false;
        this.toggleEpayPayments(false);
      }
    });
  }


  toggleEpayPayments(e) {
    if (this.epayForm.controls.EPAY_MERCHANT_ID.value.trim().length === 0
      && (this.epayForm.controls.EPAY_POS_ID.value.trim().length === 0 || this.epayForm.controls.EPAY_TERMINAL_ID.value.trim().length === 0)
      && this.epayForm.controls.EPAY_USERNAME.value.trim().length === 0
      && this.epayForm.controls.EPAY_PASSWORD.value.trim().length === 0
      && e) {
      setTimeout(() => {
        this.epayEnabled = false;
      });
      return;
    }
    if (this.epayForm.valid) {
      const formData = this.epayForm.getRawValue();
      this.store.dispatch(new UpdateStoreSettings({ PAYMENT_EPAY_CREDIT_CARD_ENABLED: e, ...formData }));
    } else {
      setTimeout(() => {
        this.epayEnabled = false;
      });

    }
  }

  connect() {
    this.epayForm.markAllAsTouched();
    const formData = this.epayForm.getRawValue();
    if (
      this.epayForm.valid &&
      formData.EPAY_PAYMENT_TYPE.trim() &&
      formData.EPAY_MERCHANT_ID.trim() &&
      (formData.EPAY_POS_ID.trim() || formData.EPAY_TERMINAL_ID.trim()) &&
      formData.EPAY_USERNAME.trim() &&
      formData.EPAY_PASSWORD.trim()
    ) {
      this.store.dispatch(new ConnectEpay({
        paymentType: formData.EPAY_PAYMENT_TYPE,
        merchantId: formData.EPAY_MERCHANT_ID,
        posId: formData.EPAY_POS_ID,
        terminalId: formData.EPAY_TERMINAL_ID,
        username: formData.EPAY_USERNAME,
        password: formData.EPAY_PASSWORD,
      }));
    }
  }
  disconnect() {
    this.store.dispatch(new DisConnectEpay());
  }

  onEpayClicked() {
    this.showFields = true;
  }

  getControl(name: string) {
    return this.epayForm.get(name);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  toggleEpayPhysicalPayments($event) {
    const isChecked = $event?.target?.value === 'PHYSICAL' ?? false;
    if (isChecked) {
      this.epayPaymentType = 'PHYSICAL';
      this.toggleRequired('EPAY_POS_ID', false);
      this.toggleRequired('EPAY_TERMINAL_ID', true);
    } else {
      this.epayPaymentType = 'ONLINE';
      this.toggleRequired('EPAY_POS_ID', true);
      this.toggleRequired('EPAY_TERMINAL_ID', false);
    }

  }

  toggleRequired(field, required) {
    const fieldControl = this.epayForm.get(field);

    // Check if 'required' validator is currently set
    if (required) {
      // Add 'required' validator
      fieldControl.setValidators(Validators.compose([Validators.required, Validators.maxLength(100)]));
    } else {
      // Remove 'required' validator
      fieldControl.clearValidators();
    }

    // Trigger re-validation
    fieldControl.patchValue('');
    fieldControl.updateValueAndValidity();
  }

  isPhysicalTerminalPaymentType() {
    return this.epayPaymentType === 'PHYSICAL';
  }

  isOnlinePaymentType() {
    return this.epayPaymentType === 'ONLINE';
  }
}
