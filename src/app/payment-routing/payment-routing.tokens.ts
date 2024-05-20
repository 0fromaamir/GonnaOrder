import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { PaymentRedirectInfoData } from '../public/payments/+state/payment.reducer';
import { PaymentStoresAction } from '../public/payments/+state/payment.actions';

export const PAYEMENTREDIRECTNFO_LOCAL_STORAGE_KEY = new InjectionToken<string>('PaymentRedirectInfoConfigToken');
export const PAYEMENTREDIRECTNFO_CONFIG_TOKEN = new InjectionToken<StoreConfig<PaymentRedirectInfoData, PaymentStoresAction>>('PaymentRedirectInfoConfigToken');

