import { getSelectedStore } from './../../+state/stores.selectors';
import { UpdateStoreSettings } from './../../+state/stores.actions';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StoresState } from './../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ConnectPayabl,
  DisConnectPayabl
} from '../+state/payment.actions';

@Component({
    selector: 'app-store-payment-payabl',
    templateUrl: './store-payment-payabl.component.html',
    styleUrls: ['./store-payment-payabl.component.scss']
})
export class StorePaymentPayablComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject();
    payablForm: FormGroup;
    payablEnabled: boolean;
    helpUrl: string;
    connectPayablForm: boolean;
    payablConnected: boolean;
    payablMerchantId: boolean;
    payablMerchantSecret: boolean;

    constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.helpUrl = 'payabl';
        this.payablForm = this.fb.group({
            PAYABL_MERCHANT_ID: ['', Validators.compose([Validators.maxLength(100)])],
            PAYABL_MERCHANT_SECRET: ['', Validators.compose([Validators.maxLength(100)])],
        }, { validator: this.requiredFieldsValidator() });

        this.store.pipe(
            select(getSelectedStore),
            filter(s => s && s.id !== -1),
            takeUntil(this.destroy$)
        ).subscribe(s => {
            this.payablForm.patchValue(s.settings, {emitEvent: false});
            this.payablEnabled = s.settings.PAYMENT_PAYABL_CREDIT_CARD_ENABLED;
            if (s.settings.PAYABL_MERCHANT_ID && s.settings.PAYABL_MERCHANT_SECRET){
                this.payablMerchantId = s.settings.PAYABL_MERCHANT_ID;
                this.payablMerchantSecret = s.settings.PAYABL_MERCHANT_SECRET;
                this.payablConnected = true;
            } else{
                this.payablMerchantId = false;
                this.payablMerchantSecret = false;
                this.payablConnected = false;
            }
        });

        this.payablForm.valueChanges.subscribe(v => {
            if (!v.PAYABL_MERCHANT_ID.trim() &&
                !v.PAYABL_MERCHANT_SECRET.trim() &&
                !this.payablConnected
                ) {
                this.payablEnabled = false;
                this.togglePayablPayments(false);
            }

        });

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    getControl(name: string) {
        return this.payablForm.get(name);
    }

    togglePayablPayments(e) {
        // Do not enable square payments if no access token and application id defined
        if (this.payablForm.controls.PAYABL_MERCHANT_ID.value.trim().length === 0
            && this.payablForm.controls.PAYABL_MERCHANT_SECRET.value.trim().length === 0
            && e) {
            setTimeout(() => {
                this.payablEnabled = false;
            });
            return;
        }
        if (this.payablForm.valid) {
            const formData = this.payablForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings({PAYMENT_PAYABL_CREDIT_CARD_ENABLED: e, ...formData}));
        } else {
            setTimeout(() => {
                this.payablEnabled = false;
            });

        }
    }

    connectPayablClicked() {
        this.connectPayablForm = true;
    }

    connect() {
      this.payablForm.markAllAsTouched();
      const formData = this.payablForm.getRawValue();
      if (
        this.payablForm.valid &&
        formData.PAYABL_MERCHANT_ID.trim() &&
        formData.PAYABL_MERCHANT_SECRET.trim()
      ) {
        this.store.dispatch(new ConnectPayabl({
          merchantId: formData.PAYABL_MERCHANT_ID,
          merchantSecret: formData.PAYABL_MERCHANT_SECRET
        }));
      }
    }

    disconnect() {
      this.store.dispatch(new DisConnectPayabl());
    }

    requiredFieldsValidator(): ValidatorFn {

        return (control: AbstractControl): {[key: string]: any} | null => {
            const payablMerchantId = control.get('PAYABL_MERCHANT_ID').value.trim();
            const payablMerchantSecret = control.get('PAYABL_MERCHANT_SECRET').value.trim();

            control.get('PAYABL_MERCHANT_ID').setErrors( {required: null} );
            control.get('PAYABL_MERCHANT_ID').updateValueAndValidity({emitEvent: false, onlySelf: true});
            control.get('PAYABL_MERCHANT_SECRET').setErrors( {required: null} );
            control.get('PAYABL_MERCHANT_SECRET').updateValueAndValidity({emitEvent: false, onlySelf: true});


            if (!payablMerchantId || !payablMerchantSecret) {
                if (!payablMerchantId) {
                    control.get('PAYABL_MERCHANT_ID').setErrors( {required: true} );
                }
                if (!payablMerchantSecret) {
                    control.get('PAYABL_MERCHANT_SECRET').setErrors( {required: true} );
                }
            }

            return null;

        };

    }

}
