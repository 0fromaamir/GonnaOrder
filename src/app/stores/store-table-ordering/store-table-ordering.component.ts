import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateStoreSettings } from './../+state/stores.actions';
import { OrderingSetting } from './../+state/stores.reducer';
import { standalonePaymentSourceSetting } from '../+state/stores.reducer';
import { enableStandalonePaymentSetting } from '../+state/stores.reducer';

@Component({
  selector: 'app-store-table-ordering',
  templateUrl: './store-table-ordering.component.html',
  styleUrls: ['./store-table-ordering.component.scss'],
})
export class StoreTableOrderingComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup = this.fb.group({});
  settings: { [key: string]: any };
  destroyed$ = new Subject<void>();
  helpUrl: string;
  helpUrlStandalonePayments: string;
  helpUrlOpenTableOnAdminOrder: string;
  country: string;
  standaloneEnabled: boolean;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) { }

  ngOnInit() {
    this.helpUrl = 'openTabOrdering';
    this.helpUrlStandalonePayments = 'standalonePayments',
      this.helpUrlOpenTableOnAdminOrder = 'openTableOnAdminOrder',
      this.settingsForm = this.fb.group({
        DELIVERY_IN_STORE_LOCATION_SELECTION_NAME: [''],
        DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL: [''],
        DELIVERY_IN_STORE_LOCATION_SELECTION_TEL: [''],
        DEFUALT_LOCATION_TYPE: [null],
        OPEN_TAP: false,
        ENABLE_STANDALONE_PAYMENT: enableStandalonePaymentSetting,
        STANDALONE_PAYMENT_SOURCE: standalonePaymentSourceSetting,
        AUTOMATIC_OPEN_TABLE: true,
        SERVICE_CHARGE_LOCATION_PERCENTAGE: 0,
      });

    this.store
      .pipe(select(getSelectedStore), takeUntil(this.destroyed$))
      .subscribe((s) => {
        this.settings = s.settings;
        this.country = s.address.country.code;
        this.settingsForm.patchValue(s.settings);

        if (s.settings.ENABLE_STANDALONE_PAYMENT === 'DISABLED') {
          this.standaloneEnabled = false;
        } else {
          this.standaloneEnabled = true;
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onLocationTypeChanged(event) {
    this.settingsForm.value.DEFUALT_LOCATION_TYPE = event.target.value;
    this.onSubmit();
  }

  onPaymentSourceChanged(event) {
    this.settingsForm.value.STANDALONE_PAYMENT_SOURCE = event.target.value;
    this.onSubmit();
  }

  onEnableStandalonePayment(event) {
    this.onSubmit();
  }

  public get OrderingSetting(): typeof OrderingSetting {
    return OrderingSetting;
  }

  onSubmit() {
    if (this.standaloneEnabled) {
      this.settingsForm.patchValue({
        ENABLE_STANDALONE_PAYMENT: 'ENABLE_OPEN_TAP',
      });
    } else {
      this.settingsForm.patchValue({
        ENABLE_STANDALONE_PAYMENT: 'DISABLED',
        STANDALONE_PAYMENT_SOURCE: null,
      });
    }
    this.store.dispatch(
      new UpdateStoreSettings(this.settingsForm.getRawValue())
    );
  }
}
