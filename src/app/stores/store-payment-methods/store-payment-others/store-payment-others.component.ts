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
  selector: 'app-store-payment-others',
  templateUrl: './store-payment-others.component.html',
  styleUrls: ['./store-payment-others.component.scss']
})
export class StorePaymentOthersComponent implements OnInit, OnDestroy {

  otherspaymentForm: FormGroup;
  paymentFlag: any;
  paypalId: any;
  unsubscribe$: Subject<void> = new Subject<void>();
  http: any;
  https: any;
  showFields: boolean;
  othersConnected: boolean;
  paymentLink: boolean;
  helpUrlOther: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder, private route: ActivatedRoute) {
    this.http = 'http://';
    this.https = 'https://';
    this.helpUrlOther = 'other';
  }

  ngOnInit() {
    this.otherspaymentForm = this.fb.group({
      POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION: ['', Validators.compose([Validators.maxLength(100)])],
      POST_ORDER_PAYMENT_LINK_GENERAL_URL: [this.https, Validators.compose([Validators.maxLength(200)])],
      POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED: ['']
    });
    this.store.select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
        this.otherspaymentForm.patchValue(s.settings);
        if (s.settings.POST_ORDER_PAYMENT_LINK_GENERAL_URL) {
          this.paymentLink = s.settings.POST_ORDER_PAYMENT_LINK_GENERAL_URL;
          this.othersConnected = true;
        } else {
          this.othersConnected = false;
        }
      });

    this.otherspaymentForm.get('POST_ORDER_PAYMENT_LINK_GENERAL_URL').valueChanges.subscribe(v => {
      if (this.otherspaymentForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_URL.value !== this.https &&
        this.otherspaymentForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.value.length === 0 &&
        !this.othersConnected
      ) {
        this.otherspaymentForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.setErrors({ required: true });
      } else {
        this.otherspaymentForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.setErrors(null);
      }
    });

  }

  onotherClicked() {
    this.showFields = true;
  }

  checkPredefault(input) {
    const field = input.target;
    if (field.value.indexOf(this.http) === -1 &&
      field.value.indexOf(this.https) === -1) {
      input.target.value = this.https;
    }
  }

  checkPredefaultPaymentLink(input) {
    const field = input.target;
    if (field.value.indexOf(this.http) === -1 &&
      field.value.indexOf(this.https) === -1) {
      input.target.value = this.https;
    }
  }


  togglePaymentLinkSwitch(input) {
    this.otherspaymentForm.get('POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED').setValue(input.target.checked);
    const form = this.otherspaymentForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(form));
  }

  getControl(name: string) {
    return this.otherspaymentForm.get(name);
  }

  connect() {
    const form = this.otherspaymentForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(form));
  }

  disconnect() {
    const form = {
      POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION: null,
      POST_ORDER_PAYMENT_LINK_GENERAL_URL: null,
      POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED: null
    };
    this.store.dispatch(new UpdateStoreSettings(form));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
