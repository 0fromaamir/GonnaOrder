import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreStandalonePaymentRoutingModule } from './store-standalone-payment-routing.module';
import { StoreModule } from '@ngrx/store';
import { standalonePaymentAdminInitialState, standalonePaymentAdminOrderReducer } from './+state/stores.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreStandalonePaymentEffects } from './+state/stores.effects';
import { StandalonePaymentOrdersComponent } from './standalone-payment-orders/standalone-payment-orders.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { storesLocationInitialState, storesLocationReducer } from '../store-location/+state/store-location.reducer';
import { StoreLocationEffects } from '../store-location/+state/store-location.effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [StandalonePaymentOrdersComponent],
  imports: [
    CommonModule,
    SharedModule,
    StoreStandalonePaymentRoutingModule,
    StoreModule.forFeature('standalonePaymentAdminState', standalonePaymentAdminOrderReducer,
      { initialState: standalonePaymentAdminInitialState }),
    StoreModule.forFeature('storesLocation', storesLocationReducer, { initialState: storesLocationInitialState }),
    EffectsModule.forFeature([StoreStandalonePaymentEffects, StoreLocationEffects])
  ]
})
export class StoreStandalonePaymentModule { }
