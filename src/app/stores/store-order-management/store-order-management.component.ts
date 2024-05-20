import { UpdateStoreSettings } from './../+state/stores.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CustomValidators } from 'src/app/shared/custom.validators';

@Component({
  selector: 'app-store-order-management',
  templateUrl: './store-order-management.component.html',
  styleUrls: ['./store-order-management.component.scss']
})
export class StoreOrderManagementComponent implements OnInit, OnDestroy {
  currentStore: string;
  paymentEnabled: boolean;
  deliveryLocationsEnabled: boolean;
  orderingDisabled: boolean;
  settingsForm: FormGroup = this.fb.group({});
  settings: { [key: string]: any };
  destroyed$ = new Subject<void>();
  hubriseConnected: boolean;
  powersoftConnected: boolean;
  helpUrl: string;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.helpUrl = 'enableCustomerAuthentication';
    this.settingsForm = this.fb.group({
      ORDER_NOTIFICATION_EMAIL_STATUS_CHANGE: [''],
      STOCK_NOTIFICATION_ENABLED: [''],
      DEFAULT_MIN_ESTIMATED_DURATION_READY: ['0', Validators.min(0)],
      DEFAULT_MAX_ESTIMATED_DURATION_READY: ['0', Validators.max(1000)],
      ORDER_NOTIFICATION_EMAIL: ['', Validators.compose([CustomValidators.email, Validators.maxLength(254)])],
      STOCK_NOTIFICATION_EMAIL: ['', Validators.compose([CustomValidators.stockemail, Validators.maxLength(254)])],
      ORDER_NOTIFICATION_SOUND: [''],
      ALLOW_ORDER_CHANGE: [''],
      ALLOW_ORDER_DELETE: [''],
      AUTO_ACCEPT_ORDERS: [''],
      DETAILED_ORDER_PDF: [''],
      RECEIPT_FONTS_OPTIONS: [''],
    });
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (!s) return;
      this.settings = s.settings;
      this.settingsForm.patchValue(
        s.settings
      );
      this.currentStore = s.aliasName;
      if (s.settings.HUBRISE_ACCESS_TOKEN && s.settings.HUBRISE_LOCATION_NAME &&
        s.settings.HUBRISE_CATALOG_NAME && s.settings.HUBRISE_CUSTOMER_LIST_NAME) {
        this.hubriseConnected = true;
      } else {
        this.hubriseConnected = false;
      }
      if (s.settings.POWERSOFT_ACCESS_TOKEN && s.settings.POWERSOFT_AGENT_CODE &&
        s.settings.POWERSOFT_GENERIC_CUSTOMER_CODE && s.settings.POWERSOFT_GENERIC_CUSTOMER_EMAIL) {
        this.powersoftConnected = true;
      } else {
        this.powersoftConnected = false;
      }
    });

  }
  get email() {
    return this.settingsForm.get('ORDER_NOTIFICATION_EMAIL');
  }
  
  get stockemail() {
   return this.settingsForm.get('STOCK_NOTIFICATION_EMAIL');
  
  }

  

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit(btn = null) {
    if (this.defaultMinNumber.invalid || this.defaultMinNumber.errors) {
      return;
    }
    if (this.defaultMaxNumber.invalid || this.defaultMaxNumber.errors) {
      return;
    }
    if (this.orderNotifiicationEmailId.invalid || this.orderNotifiicationEmailId.errors) {
      return;
    }
    if (this.orderStockNotifiicationEmailId.invalid || this.orderStockNotifiicationEmailId.errors) {
      return;
    }


    const settings = this.settingsForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(this.settingsForm.getRawValue()));
  }
  get orderNotifiicationEmailId() {
    return this.settingsForm.get('ORDER_NOTIFICATION_EMAIL');
  }

  get orderStockNotifiicationEmailId() {
    return this.settingsForm.get('STOCK_NOTIFICATION_EMAIL');
  }
  get defaultMinNumber() {
    return this.settingsForm.get('DEFAULT_MIN_ESTIMATED_DURATION_READY');
  }
  get defaultMaxNumber() {
    return this.settingsForm.get('DEFAULT_MAX_ESTIMATED_DURATION_READY');
  }
}
