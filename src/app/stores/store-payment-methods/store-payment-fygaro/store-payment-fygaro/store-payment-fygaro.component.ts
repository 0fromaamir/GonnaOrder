import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subject } from "rxjs";
import { select, Store } from '@ngrx/store';
import { StoresState } from '../../../+state/stores.reducer';
import { getSelectedStore } from '../../../+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { ConnectFygaro, DisConnectFygaro } from '../../+state/payment.actions';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { UpdateStoreSettings } from '../../../+state/stores.actions';

@Component({
  selector: 'app-store-payment-fygaro',
  templateUrl: './store-payment-fygaro.component.html',
  styleUrls: ['./store-payment-fygaro.component.scss']
})
export class StorePaymentFygaroComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public fygaroForm: FormGroup;
  public fygaroEnabled: boolean;
  public fygaroConnected: boolean;
  public fygaroPaymentApiKey: string;
  public fygaroPaymentApiSecret: string;
  public fygaroHookApiKey: string;
  public fygaroHookApiSecret: string;
  public fygaroCheckoutUrl: string;
  helpUrl: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.helpUrl = 'fygaro';
    this.fygaroForm = this.fb.group({
      FYGARO_CHECKOUT_URL: ['', [Validators.required, Validators.maxLength(255), this.noWhitespace, Validators.pattern('^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')]],
      FYGARO_PAYMENT_API_KEY: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      FYGARO_PAYMENT_API_SECRET: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      FYGARO_HOOK_API_KEY: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      FYGARO_HOOK_API_SECRET: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.FYGARO_CHECKOUT_URL && s.settings.FYGARO_PAYMENT_API_KEY && s.settings.FYGARO_PAYMENT_API_SECRET && s.settings.FYGARO_HOOK_API_KEY && s.settings.FYGARO_HOOK_API_SECRET) {
        this.fygaroForm.patchValue(s.settings, {emitEvent: false});
        this.fygaroConnected = true;
        this.fygaroCheckoutUrl = s.settings.FYGARO_CHECKOUT_URL;
        this.fygaroPaymentApiKey = s.settings.FYGARO_PAYMENT_API_KEY;
        this.fygaroPaymentApiSecret = s.settings.FYGARO_PAYMENT_API_SECRET;
        this.fygaroHookApiKey = s.settings.FYGARO_HOOK_API_KEY;
        this.fygaroHookApiSecret = s.settings.FYGARO_HOOK_API_SECRET;
        this.fygaroEnabled = s.settings.PAYMENT_FYGARO_CREDIT_CARD_ENABLED;
      } else {
        this.fygaroConnected = false;
        this.fygaroEnabled = false;
        this.fygaroCheckoutUrl = ''
        this.fygaroPaymentApiKey = '';
        this.fygaroPaymentApiSecret = '';
        this.fygaroHookApiKey = '';
        this.fygaroHookApiSecret = '';
      }
    });

    // tslint:disable
    this.fygaroForm.valueChanges.subscribe(v => {
      if (!v.FYGARO_CHECKOUT_URL.trim() &&
        !v.FYGARO_PAYMENT_API_KEY.trim() &&
        !v.FYGARO_PAYMENT_API_SECRET.trim() &&
        !v.FYGARO_HOOK_API_KEY.trim() &&
        !v.FYGARO_HOOK_API_SECRET.trim() &&
        !this.fygaroConnected
      ) {
        this.fygaroEnabled = false;
        this.toggleFygaroPayments(false);
      }
    });
    // tslint:enable
  }

  onFygaroClicked() {
    this.showFields = true;
  }

  connect() {
    this.fygaroForm.markAllAsTouched();
    const formData = this.fygaroForm.getRawValue();
    if (
      this.fygaroForm.valid &&
      formData.FYGARO_CHECKOUT_URL.trim() &&
      formData.FYGARO_PAYMENT_API_KEY.trim() &&
      formData.FYGARO_PAYMENT_API_SECRET.trim() &&
      formData.FYGARO_HOOK_API_KEY.trim() &&
      formData.FYGARO_HOOK_API_SECRET.trim()
    ) {
      this.store.dispatch(new ConnectFygaro({
        checkoutUrl: formData.FYGARO_CHECKOUT_URL,
        paymentApiKey: formData.FYGARO_PAYMENT_API_KEY,
        paymentApiSecret: formData.FYGARO_PAYMENT_API_SECRET,
        hookApiKey: formData.FYGARO_HOOK_API_KEY,
        hookApiSecret: formData.FYGARO_HOOK_API_SECRET,
      }));
    }
  }

  // tslint:disable
  disconnect() {
    this.store.dispatch(new DisConnectFygaro());
  }

  // tslint:enable


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.fygaroForm.get(name);
  }

  toggleFygaroPayments(e) {
    if (this.fygaroForm.controls.FYGARO_CHECKOUT_URL.value.trim().length === 0
      && this.fygaroForm.controls.FYGARO_PAYMENT_API_KEY.value.trim().length === 0
      && this.fygaroForm.controls.FYGARO_PAYMENT_API_SECRET.value.trim().length === 0
      && this.fygaroForm.controls.FYGARO_HOOK_API_KEY.value.trim().length === 0
      && this.fygaroForm.controls.FYGARO_HOOK_API_SECRET.value.trim().length === 0
      && e) {
      setTimeout(() => {
        this.fygaroEnabled = false;
      });
      return;
    }
    if (this.fygaroForm.valid) {
      const formData = this.fygaroForm.getRawValue();
      this.store.dispatch(new UpdateStoreSettings({PAYMENT_FYGARO_CREDIT_CARD_ENABLED: e, ...formData}));
    } else {
      setTimeout(() => {
        this.fygaroEnabled = false;
      });

    }
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
}
