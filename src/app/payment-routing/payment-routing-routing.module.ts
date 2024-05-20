import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LocalStorageService } from '../local-storage.service';
import { PaymentStoresEffects } from '../public/payments/+state/payment.effects';
import { paymentRedirectInfoReducer } from '../public/payments/+state/payment.reducer';
import { storageMetaReducer } from '../storage.metareducer';
import { PAYEMENTREDIRECTNFO_CONFIG_TOKEN, PAYEMENTREDIRECTNFO_LOCAL_STORAGE_KEY } from './payment-routing.tokens';
import { VivaComponent } from './viva/viva.component';
import { FygaroComponent } from './fygaro/fygaro.component';
import {EpayComponent} from "./epay/epay.component";

const routes: Routes = [
{ path: 'viva', component: VivaComponent },
{ path: 'fygaro', component: FygaroComponent },
{ path: 'epay', component: EpayComponent },
{ path: 'epay/cancel', component: EpayComponent }

];

export function getPaymentRedirectInfoConfig(
  localStorageKey: string,
  storageService: LocalStorageService
) {
  return {
    metaReducers: [
      storageMetaReducer(
        ({ paymentRedirectInfo }) => ({ paymentRedirectInfo }),
        localStorageKey,
        storageService
      )
    ]
  };
}

@NgModule({
  imports: [RouterModule.forChild(routes),
    EffectsModule.forFeature([PaymentStoresEffects]),
    StoreModule.forFeature('paymentRedirectInfo', paymentRedirectInfoReducer, PAYEMENTREDIRECTNFO_CONFIG_TOKEN)
  ],
  exports: [RouterModule],
  providers: [
    { provide: PAYEMENTREDIRECTNFO_LOCAL_STORAGE_KEY, useValue: '__paymentRedirectInfo_storage__' },
    {
      provide: PAYEMENTREDIRECTNFO_CONFIG_TOKEN,
      deps: [PAYEMENTREDIRECTNFO_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getPaymentRedirectInfoConfig
    }]
})
export class PaymentRoutingRoutingModule { }
