import { getSelectedStore } from '../../+state/stores.selectors';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConnectVivaPayments, DisconnectVivaPayments } from '../+state/payment.actions';

@Component({
    selector: 'app-store-payment-viva',
    templateUrl: './store-payment-viva.component.html',
    styleUrls: ['./store-payment-viva.component.scss']
})
export class StorePaymentVivaComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject();
    vivaForm: FormGroup;
    vivaEnabled: boolean;
    helpUrl: string;
    connectVivaForm: boolean;
    vivaformConnectedPrev: boolean;
    vivaMerchantId: boolean | string;
    vivaApiKey: string;

    constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.helpUrl = 'vivawallet';
        this.vivaForm = this.fb.group({
            VIVA_CLIENT_ID: ['', Validators.compose([Validators.maxLength(100)])],
            VIVA_CLIENT_SECRET: ['', Validators.compose([Validators.maxLength(100)])],
            VIVA_MERCHANT_ID: ['', Validators.compose([Validators.maxLength(100)])],
            VIVA_API_KEY: ['', Validators.compose([Validators.maxLength(100)])],
        }, { validator: this.requiredFieldsValidator() });

        this.store.pipe(
            select(getSelectedStore),
            filter(s => s && s.id !== -1),
            takeUntil(this.destroy$)
        ).subscribe(s => {
            this.vivaForm.patchValue(s.settings, { emitEvent: false });
            this.vivaEnabled = s.settings.PAYMENT_VIVA_CREDIT_CARD_ENABLED;
            if (s.settings.VIVA_MERCHANT_ID) {
                this.vivaMerchantId = s.settings.VIVA_MERCHANT_ID;
                this.vivaApiKey = s.settings.VIVA_API_KEY;
                this.connectVivaForm = true;
                this.vivaformConnectedPrev = true;
            } else {
                this.vivaMerchantId = false;
                this.vivaApiKey = '';
                this.connectVivaForm = false;
                this.vivaformConnectedPrev = false;
            }
        });

        this.vivaForm.valueChanges.subscribe(v => {
            if (!v.VIVA_CLIENT_ID.trim() &&
                !v.VIVA_CLIENT_SECRET.trim() &&
                !v.VIVA_MERCHANT_ID.trim() &&
                !v.VIVA_API_KEY.trim() &&
                !this.vivaformConnectedPrev
            ) {
                this.vivaEnabled = false;
                this.toggleVivaPayments(false);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getControl(name: string) {
        return this.vivaForm.get(name);
    }

    toggleVivaPayments(e) {
        if (this.vivaForm.controls.VIVA_CLIENT_ID.value.trim().length === 0
            && this.vivaForm.controls.VIVA_CLIENT_SECRET.value.trim().length === 0
            && this.vivaForm.controls.VIVA_MERCHANT_ID.value.trim().length === 0
            && this.vivaForm.controls.VIVA_API_KEY.value.trim().length === 0
            && e) {
            setTimeout(() => {
                this.vivaEnabled = false;
            });
            return;
        }
        if (this.vivaForm.valid) {
            const formData = this.vivaForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings({ PAYMENT_VIVA_CREDIT_CARD_ENABLED: e, ...formData }));
        } else {
            setTimeout(() => {
                this.vivaEnabled = false;
            });

        }
    }

    connectVivaClicked() {
        this.connectVivaForm = true;
    }

    connectViva() {
        this.store.dispatch(new ConnectVivaPayments({ merchantId: this.vivaForm.getRawValue().VIVA_MERCHANT_ID , apiKey: this.vivaForm.getRawValue().VIVA_API_KEY }));
    }

    disconnect() {
        this.store.dispatch(new DisconnectVivaPayments());
    }

    requiredFieldsValidator(): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } | null => {
            const merchantId = control.get('VIVA_MERCHANT_ID').value.trim();
            control.get('VIVA_MERCHANT_ID').setErrors({ required: null });
            control.get('VIVA_MERCHANT_ID').updateValueAndValidity({ emitEvent: false, onlySelf: true });
            if (!merchantId) {
                control.get('VIVA_MERCHANT_ID').setErrors({ required: true });
            }
            const apiKey = control.get('VIVA_API_KEY').value.trim();
            control.get('VIVA_API_KEY').setErrors({ required: null });
            control.get('VIVA_API_KEY').updateValueAndValidity({ emitEvent: false, onlySelf: true });
            if (!apiKey) {
                control.get('VIVA_API_KEY').setErrors({ required: true });
            }
            return null;
        };

    }

}
