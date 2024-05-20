import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {select, Store} from "@ngrx/store";
import {StoresState} from "../../+state/stores.reducer";
import {getSelectedStore} from "../../+state/stores.selectors";
import {filter, takeUntil} from "rxjs/operators";
import {ConnectApcopay, DisConnectApcopay} from "../+state/payment.actions";
import {UpdateStoreSettings} from "../../+state/stores.actions";

@Component({
  selector: 'app-store-payment-apcopay',
  templateUrl: './store-payment-apcopay.component.html',
  styleUrls: ['./store-payment-apcopay.component.scss']
})
export class StorePaymentApcopayComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public apcopayForm: FormGroup;
  public apcopayEnabled: boolean;
  public apcopayConnected: boolean;
  public apcopayMerchantCode: string;
  public apcopayMerchantPassword: string;
  public apcopaySecretWord: string;
  public apcopayProfileId: string;
  helpUrl: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.helpUrl = 'apcopay';
    this.apcopayForm = this.fb.group({
      APCOPAY_MERCHANT_CODE: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      APCOPAY_MERCHANT_PASSWORD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      APCOPAY_PROFILE_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      APCOPAY_SECRET_WORD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.APCOPAY_MERCHANT_CODE && s.settings.APCOPAY_MERCHANT_PASSWORD && s.settings.APCOPAY_PROFILE_ID && s.settings.APCOPAY_SECRET_WORD) {
        this.apcopayForm.patchValue(s.settings, {emitEvent: false});
        this.apcopayConnected = true;
        this.apcopayMerchantCode = s.settings.APCOPAY_MERCHANT_CODE;
        this.apcopayMerchantPassword = s.settings.APCOPAY_MERCHANT_PASSWORD;
        this.apcopayProfileId = s.settings.APCOPAY_PROFILE_ID;
        this.apcopaySecretWord = s.settings.APCOPAY_SECRET_WORD
        this.apcopayEnabled = s.settings.PAYMENT_APCOPAY_CREDIT_CARD_ENABLED;
      } else {
        this.apcopayConnected = false;
        this.apcopayEnabled = false;
        this.apcopayMerchantCode = ''
        this.apcopayMerchantPassword = '';
        this.apcopayProfileId = '';
        this.apcopaySecretWord = '';
      }
    });

    // tslint:disable
    this.apcopayForm.valueChanges.subscribe(v => {
      if (!v.APCOPAY_MERCHANT_CODE.trim() &&
        !v.APCOPAY_MERCHANT_PASSWORD.trim() &&
        !v.APCOPAY_PROFILE_ID.trim() &&
        !v.APCOPAY_SECRET_WORD.trim() &&
        !this.apcopayConnected
      ) {
        this.apcopayEnabled = false;
        this.toggleApcopayPayments(false);
      }
    });
    // tslint:enable
  }

  onApcopayClicked() {
    this.showFields = true;
  }

  connect() {
    this.apcopayForm.markAllAsTouched();
    const formData = this.apcopayForm.getRawValue();
    if (
      this.apcopayForm.valid &&
      formData.APCOPAY_MERCHANT_CODE.trim() &&
      formData.APCOPAY_MERCHANT_PASSWORD.trim() &&
      formData.APCOPAY_PROFILE_ID.trim() &&
      formData.APCOPAY_SECRET_WORD.trim()
    ) {
      this.store.dispatch(new ConnectApcopay({
        profileId: formData.APCOPAY_PROFILE_ID,
        secretWord: formData.APCOPAY_SECRET_WORD,
        merchantCode: formData.APCOPAY_MERCHANT_CODE,
        merchantPassword: formData.APCOPAY_MERCHANT_PASSWORD,
      }));
    }
  }

  // tslint:disable
  disconnect() {
    this.store.dispatch(new DisConnectApcopay());
  }

  // tslint:enable


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.apcopayForm.get(name);
  }

  toggleApcopayPayments(e) {
    if (this.apcopayForm.controls.APCOPAY_MERCHANT_CODE.value.trim().length === 0
      && this.apcopayForm.controls.APCOPAY_MERCHANT_PASSWORD.value.trim().length === 0
      && this.apcopayForm.controls.APCOPAY_PROFILE_ID.value.trim().length === 0
      && this.apcopayForm.controls.APCOPAY_SECRET_WORD.value.trim().length === 0
      && e) {
      setTimeout(() => {
        this.apcopayEnabled = false;
      });
      return;
    }
    if (this.apcopayForm.valid) {
      const formData = this.apcopayForm.getRawValue();
      this.store.dispatch(new UpdateStoreSettings({PAYMENT_APCOPAY_CREDIT_CARD_ENABLED: e, ...formData}));
    } else {
      setTimeout(() => {
        this.apcopayEnabled = false;
      });

    }
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

}
