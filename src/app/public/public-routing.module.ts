import { BasketEnabledGuard } from './basket-enabled.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicLayoutComponent } from '../layout/public-layout/public-layout.component';
import { StoreLoadingComponent } from './store/store-loading/store-loading.component';
import { StoreDashboardComponent } from './store/store-dashboard/store-dashboard.component';
import { StoreItemDetailsComponent } from './store/store-item-details/store-item-details.component';
import { StoreCheckoutComponent } from './store/store-checkout/store-checkout.component';
import { StoreCheckoutPaymentComponent } from './store/store-checkout/store-checkout-payment/store-checkout-payment.component';
import { StoreLoadingGuard } from './store-loading.guard';
import { AdminStoreLoadingGuard } from './admin-store-loading.guard';
import { AdminBasketEnabledGuard } from './admin-basket-enabled.guard';
import { PaymentRedirectGuard } from './payments/payment-redirect.guard';
import { StandalonePaymentComponent } from './store/standalone-payment/standalone-payment.component';
import { StoreStandaloneThankYouComponent } from './store/store-standalone-thank-you/store-standalone-thank-you.component';
import { StandaloneThankyouGuard } from './standalone-thankyou.guard';
import { StoreStandaloneErrorComponent } from './store/store-standalone-error/store-standalone-error.component';
import { mapToCanActivate } from '../functional-guards';
import { StoreMainComponent } from './store/store-main/store-main.component';
import { StoreRecentsComponent } from './store/store-recents/store-recents.component';
import { CustomerModeGuard } from './customer-mode.guard';
import {PaymentProgressComponent} from "./store/payment-progress/payment-progress.component";
import {StorePaymentPayComponent} from "./store/store-payment-pay/store-payment-pay.component";


const routes: Routes = [
  {
    path: 'customer',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: StoreMainComponent },
      { path: 'recents', component: StoreRecentsComponent },
      { path: 'store/:storeAlias', component: StoreLoadingComponent, canActivate: mapToCanActivate([StoreLoadingGuard, BasketEnabledGuard]) },
      { path: 'location/:locationid', component: StoreLoadingComponent, canActivate: mapToCanActivate([StoreLoadingGuard, BasketEnabledGuard]) },
    ]
  },
  { path: ':storeAlias/payment-redirect/sp/:provider/:storeId/:orderUuid', canActivate: mapToCanActivate([PaymentRedirectGuard]), children: []},
  { path: 'sp/:provider/:storeId/:orderUuid', canActivate: mapToCanActivate([PaymentRedirectGuard]), children: []},
  { path: ':storeAlias/payment-redirect/:provider/:storeId/:orderUuid', canActivate: mapToCanActivate([PaymentRedirectGuard]), children: []},
  { path: ':provider/:storeId/:orderUuid', canActivate: mapToCanActivate([PaymentRedirectGuard]), children: []},
  { path: 'orderToken/:orderToken', component: StandalonePaymentComponent, canActivate: mapToCanActivate([StoreLoadingGuard]) },
  { path: 'amount/:amount', component: StandalonePaymentComponent, canActivate: mapToCanActivate([StoreLoadingGuard]) },
  { path: 'l/:l', component: StandalonePaymentComponent, canActivate: mapToCanActivate([StoreLoadingGuard]) },
  { path: 'standalone-payment-progress', component: PaymentProgressComponent, canActivate: mapToCanActivate([StoreLoadingGuard]) },
  { path: 'standalone-payment-pay', component: StorePaymentPayComponent, canActivate: mapToCanActivate([StoreLoadingGuard]) },
  { path: 'standalone-payment-success', component: StoreStandaloneThankYouComponent,
  canActivate: mapToCanActivate([StoreLoadingGuard, StandaloneThankyouGuard])},
  { path: 'standalone-payment-error', component: StoreStandaloneErrorComponent, canActivate: mapToCanActivate([StoreLoadingGuard])},
  { path: '', component: StoreLoadingComponent, canActivate: mapToCanActivate([CustomerModeGuard, StoreLoadingGuard, BasketEnabledGuard]) },
  { path: 'location/:locationid', component: StoreLoadingComponent, canActivate: mapToCanActivate([StoreLoadingGuard, BasketEnabledGuard]) },
  { path: ':storeAlias', component: StoreLoadingComponent, canActivate: mapToCanActivate([AdminStoreLoadingGuard, AdminBasketEnabledGuard]) },
  // { path: 'catalog', component: StoreDashboardComponent},
  // { path: 'dashboard', component: StoreDashboardComponent},
  // { path: 'item', component: StoreItemDetailsComponent},
  // { path: 'checkout', component: StoreCheckoutComponent},
  // { path: 'payment', component: StoreCheckoutPaymentComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
