import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { takeUntil } from 'rxjs/operators';
import { getSelectedStore } from '../+state/stores.selectors';
import { ClientStore } from '../stores';
import { UpdateStoreSettings } from '../+state/stores.actions';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-store-payment-methods',
  templateUrl: './store-payment-methods.component.html',
  styleUrls: ['./store-payment-methods.component.scss']
})
export class StorePaymentMethodsComponent implements OnInit, OnDestroy {

  paymentEnabled: boolean;
  orderingDisabled: boolean;
  settings: { [key: string]: any };
  settingsForm: FormGroup = this.fb.group({});
  selectedStore: ClientStore;
  private destroy$ = new Subject();
  helpUrl: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit() {
    this.helpUrl = 'paymentOptions';
    this.settingsForm = this.fb.group({
      PAYMENT_OPTION: [''],
      OPTIONAL_PAYMENT_PRESELECTED: [''],
      PAY_LATER_OPTION: ['']
    });

    this.store
      .select(getSelectedStore)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((state) => {
        this.selectedStore = state;
        this.settings = state.settings;
        this.settingsForm.patchValue(state.settings);
        this.paymentEnabled = state.settings.PAYMENT_PAYPAL_ENABLED ||
          state.settings.PAYMENT_STRIPE_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_SQUARE_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_VIVA_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_JCC_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_PAYABL_CREDIT_CARD_ENABLED ||
          state.settings.POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED ||
          state.settings.PAYMENT_RMS_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED ||
          state.settings.POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED ||
          state.settings.PAYMENT_GLOBAL_PAY_CREDIT_CARD_ENABLED ||
          state.settings.PAYMENT_MOLLIE_CREDIT_CARD_ENABLED
        this.orderingDisabled = !this.settings.ENABLE_ORDERING;
      });
  }

  onSubmit(): void {
    this.store.dispatch(new UpdateStoreSettings(this.settingsForm.getRawValue()));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
