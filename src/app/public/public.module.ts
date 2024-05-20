import { BasketEnabledGuard } from './basket-enabled.guard';
import { AdminBasketEnabledGuard } from './admin-basket-enabled.guard';
import { AdminStoreLoadingGuard } from './admin-store-loading.guard';
import { LayoutModule } from './../layout/layout.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

import {TranslateLoader, TranslateModule, TranslateParser} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';

import { PublicRoutingModule } from './public-routing.module';
import { StoreLoadingComponent } from './store/store-loading/store-loading.component';
import { StoreDashboardComponent } from './store/store-dashboard/store-dashboard.component';
import { StoreItemDetailsComponent } from './store/store-item-details/store-item-details.component';
import { StoreCheckoutComponent } from './store/store-checkout/store-checkout.component';
import { StoreCheckoutPaymentComponent } from './store/store-checkout/store-checkout-payment/store-checkout-payment.component';
import { StoreModule } from '@ngrx/store';
import {
  selectedStoresReducer,
  selectedStoreInitialState,
  catalogInitialState,
  cartInitialState,
  cartStateReducer,
  viewStateReducer,
  viewInitialState,
  offerItemStateReducer,
  offerItemInitialState,
  orderMetaDataReducer,
  orderMetaInitialState,
  errorReducer,
  errorInitialState,
  OrderStatusInitialState,
  orderStatusReducer,
  combinedOrderReducer,
  standalonePaymentOrderReducer,
  storeLocationsReducer,
  storeLocationInitialState,
  orderEmailInitialState,
  orderEmailReducer,
  checkoutStateReducer,
  checkoutInitialState,
  cookieStateReducer,
  cookieInitialState,
  zoneStateReducer,
  zoneInitialState,
  currentCatStateReducer,
  currentCatInitialState,
  storeRulesReducer,
  storeRulesInitialState,
  socialLoginReducer,
  socialLoginInitialState,
  customerDetailsUpdateReducer,
  customerDetailsUpdateInitialState,
  combinedOrderInitialState,
  standalonePaymentInitialState,
  linkCodeStateReducer,
  linkCodeInitialState,
  storedCustomerStateReducer,
  storedCustomerDataInitialState,
  storesRecentsReducer,
  mobileStoreReducer,
  mobileStoreInitialState,
  customerLoyaltyInitialState,
  customerLoyaltyReducer,
  customerFooterReducer,
  customerFooterHeightInitialState
} from './store/+state/stores.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SelectedStoresEffects } from './store/+state/stores.effects';
import { storesCatalogReducer } from './store/+state/stores.reducer';
import { StoreThankYouComponent } from './store/store-thank-you/store-thank-you.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { PaymentStoresEffects } from './payments/+state/payment.effects';
import {
  paypalStateReducer,
  paypalInitialState,
  vivaStateReducer,
  vivaInitialState,
  paymentSenseStateReducer,
  paymentSenseInitialState,
  trustPaymentsStateReducer,
  trustPaymentsInitialState,
  jccStateReducer,
  jccInitialState,
  squareStateReducer,
  squareInitialState,
  orderPaymentInitialState,
  orderPaymentStateReducer,
  globalPayInitialState,
  globalPayStateReducer,
  realexPaymentStateReducer,
  realexPaymentInitialState,
  rmsInitialState,
  rmsStateReducer,
  completePaymentStateReducer,
  completePaymentInitialState
} from './payments/+state/payment.reducer';
import { LocationService } from './location.service';
import { StoreErrorComponent } from './store/store-error/store-error.component';
import { StoreCatalogLanguageSelectorComponent } from './store/store-catalog-language-selector/store-catalog-language-selector.component';
import { StoreEmptyCartComponent } from './store/store-empty-cart/store-empty-cart.component';
import { FormatPrice } from '../shared/format-price.pipe';
import { StoreCheckoutDeliveryComponent } from './store/store-checkout/store-checkout-delivery/store-checkout-delivery.component';
import { StoreCheckoutDeliveryToAddressComponent } from './store/store-checkout/store-checkout-delivery-to-address/store-checkout-delivery-to-address.component';
import { StoreCheckoutReadOnlyLocationComponent } from './store/store-checkout/store-checkout-readonly-location/store-checkout-readonly-location.component';
import { StoreCheckoutSelfPickupComponent } from './store/store-checkout/store-checkout-selfpickup/store-checkout-selfpickup.component';
import {
  StoreCheckoutSpecialNoteComponent
} from './store/store-checkout/store-checkout-special-note/store-checkout-special-note.component';
import { CheckoutService } from './store/store-checkout/checkout.service';
import { StoreCheckoutDeliveryAtLocationComponent } from './store/store-checkout/store-checkout-delivery-at-location/store-checkout-delivery-at-location.component';
import { SharedModule } from '../shared/shared.module';
import { CustomParser } from '../translate.parser';
import {
  StoreCheckoutOrderWishTimePanelComponent
} from './store/store-checkout/store-checkout-order-wish-time-panel/store-checkout-order-wish-time-panel.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TextMaskModule } from 'angular2-text-mask';
import { StoreCheckoutPromotionComponent } from './store/store-checkout/store-checkout-promotion/store-checkout-promotion.component';
import { StoreCheckoutFeeRulesComponent } from './store/store-checkout/store-checkout-fee-rules/store-checkout-fee-rules.component';
import { OfferUnavailableDialogComponent } from './store/store-checkout/offer-unavailable-dialog/offer-unavailable-dialog.component';
import { OfferOutofstockDialogComponent } from './store/store-checkout/offer-outofstock-dialog/offer-outofstock-dialog.component';
import {
  StoreCheckoutVoucherCodeComponent
} from './store/store-checkout/store-checkout-voucher-code/store-checkout-voucher-code.component';
import { UnavailableSlotDialogComponent } from './store/store-checkout/unavailable-slot-dialog/unavailable-slot-dialog.component';
import { SameDayOrderingDialogComponent } from './store/store-checkout/same-day-ordering-dialog/same-day-ordering-dialog.component';
import { StoreCheckoutOrderTimeSelectorComponent } from './store/store-checkout/store-checkout-order-time-selector/store-checkout-order-time-selector.component';
import {
  StoreCheckoutErrorDialogComponent
} from './store/store-checkout/store-checkout-error-dialog/store-checkout-error-dialog.component';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApplicationStateModule } from '../application-state/application-state.module';
import { StoreSiblingSelectorComponent } from './store/store-sibling-selector/store-sibling-selector.component';
import { StandalonePaymentDivideAamountComponent } from './store/standalone-payment/standalone-payment-divide-amount/standalone-payment-divide-aamount.component';
import { StandalonePaymentComponent } from './store/standalone-payment/standalone-payment.component';
import { StandalonePaymentTipComponent } from './store/standalone-payment/standalone-payment-tip/standalone-payment-tip.component';
import { StandalonePaymentInformationComponent } from './store/standalone-payment/standalone-payment-information/standalone-payment-information.component';
import { PaymentRedirectGuard } from './payments/payment-redirect.guard';
import { StandalonePaymentPaidAmountComponent } from './store/standalone-payment/standalone-payment-paid-amount/standalone-payment-paid-amount.component';
import { StoreStandaloneThankYouComponent } from './store/store-standalone-thank-you/store-standalone-thank-you.component';
import { StoreStandaloneErrorComponent } from './store/store-standalone-error/store-standalone-error.component';
import { TrackingService } from './tracking.service';
import { GlobalpayComponent } from './payments/globalpay/globalpay.component';
import { RealexpaymentComponent } from './payments/realexpayment/realexpayment.component';
import { RmsComponent } from './payments/rms/rms.component';
import { StoreChildShowcaseComponent } from './store/store-dashboard/store-child-showcase/store-child-showcase.component';
import { StorePageComponent } from './store/store-dashboard/store-page/store-page.component';
import { StorePageHeaderComponent } from './store/store-dashboard/store-page-header/store-page-header.component';
import { OpenTimeModalComponent } from './store/store-dashboard/open-time-modal/open-time-modal.component';
import { TrustpaymentComponent } from './payments/trustpayment/trustpayment.component';
import { StoreMainComponent } from './store/store-main/store-main.component';
import { StoreRecentsComponent } from './store/store-recents/store-recents.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpLoaderFactory } from '../app.module';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../local-storage.service';
import { storageMetaReducer } from '../storage.metareducer';
import { STORERECENTS_LOCAL_STORAGE_KEY, STORERECENTS_CONFIG_TOKEN } from './store.tokens';
import { PaymentProgressComponent } from "./store/payment-progress/payment-progress.component";
import { PaymentProgressLogoComponent } from './store/payment-progress-logo/payment-progress-logo.component';
import {ScriptLoaderService} from "./script-loader.service";
import { InactivityModalComponent } from './store/inactivity-modal/inactivity-modal.component';
import { StoreCheckoutLoyaltyComponent } from './store/store-checkout/store-checkout-loyalty/store-checkout-loyalty.component';
import { CustomerLoginComponent } from './store/store-checkout/customer-login/customer-login.component';
import { ApcopayComponent } from './payments/apcopay/apcopay.component';
import { MatIconModule } from '@angular/material/icon';
import { HobexComponent } from './payments/hobex/hobex.component';
import { StorePaymentPayComponent } from './store/store-payment-pay/store-payment-pay.component';

export function getStoreRecentsConfig(
  localStorageKey: string,
  storageService: LocalStorageService
) {
  return { metaReducers: [storageMetaReducer(({ storeRecents }) => ({ storeRecents }), localStorageKey, storageService)] };
}

const translation = environment.mode === 'Customer' ||
                    environment.mode === 'Template'
                    ? []
                    : [
                        TranslateModule.forChild({
                          loader: {
                              provide: TranslateLoader,
                              useFactory: HttpLoaderFactory,
                              deps: [HttpClient]
                          },
                          parser: {provide: TranslateParser, useClass: CustomParser},
                          isolate: true
                        })
                      ];

@NgModule({
  declarations: [
    StoreMainComponent,
    StoreRecentsComponent,
    StoreLoadingComponent,
    StoreDashboardComponent,
    StoreChildShowcaseComponent,
    StorePageComponent,
    StorePageHeaderComponent,
    OpenTimeModalComponent,
    StoreItemDetailsComponent,
    StoreCheckoutComponent,
    StoreCheckoutPaymentComponent,
    StoreCheckoutLoyaltyComponent,
    StoreThankYouComponent,
    StoreErrorComponent,
    StoreCatalogLanguageSelectorComponent,
    StoreEmptyCartComponent,
    StoreCheckoutDeliveryComponent,
    StoreCheckoutDeliveryToAddressComponent,
    StoreCheckoutReadOnlyLocationComponent,
    StoreCheckoutSelfPickupComponent,
    StoreCheckoutSpecialNoteComponent,
    StoreCheckoutDeliveryAtLocationComponent,
    StoreCheckoutOrderWishTimePanelComponent,
    StoreCheckoutPromotionComponent,
    StoreCheckoutFeeRulesComponent,
    OfferUnavailableDialogComponent,
    OfferOutofstockDialogComponent,
    StoreCheckoutVoucherCodeComponent,
    UnavailableSlotDialogComponent,
    SameDayOrderingDialogComponent,
    StoreCheckoutOrderTimeSelectorComponent,
    StoreCheckoutErrorDialogComponent,
    StoreSiblingSelectorComponent,
    StandalonePaymentDivideAamountComponent,
    StandalonePaymentComponent,
    StandalonePaymentTipComponent,
    StandalonePaymentInformationComponent,
    StandalonePaymentPaidAmountComponent,
    StoreStandaloneThankYouComponent,
    StoreStandaloneErrorComponent,
    GlobalpayComponent,
    RealexpaymentComponent,
    RmsComponent,
    TrustpaymentComponent,
    PaymentProgressComponent,
    PaymentProgressLogoComponent,
    InactivityModalComponent,
    CustomerLoginComponent,
    ApcopayComponent,
    HobexComponent,
    StorePaymentPayComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    PublicRoutingModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    ApplicationStateModule,
    StoreModule.forFeature('selectedStore', selectedStoresReducer, {initialState: selectedStoreInitialState}),
    StoreModule.forFeature('selectedStoreCatalog', storesCatalogReducer, {initialState: catalogInitialState}),
    StoreModule.forFeature('currentOfferItem', offerItemStateReducer, {initialState: offerItemInitialState}),
    StoreModule.forFeature('currentCartState', cartStateReducer, {initialState: cartInitialState}),
    StoreModule.forFeature('currentStoreViewState', viewStateReducer, {initialState: viewInitialState}),
    StoreModule.forFeature('currentOrderMetaState', orderMetaDataReducer, {initialState: orderMetaInitialState}),
    StoreModule.forFeature('currentPaypalState', paypalStateReducer, {initialState: paypalInitialState}),
    StoreModule.forFeature('currentVivaState', vivaStateReducer, {initialState: vivaInitialState}),
    StoreModule.forFeature('errorState', errorReducer, {initialState: errorInitialState}),
    StoreModule.forFeature('orderStatus', orderStatusReducer, {initialState: OrderStatusInitialState}),
    StoreModule.forFeature('combinedOrderState', combinedOrderReducer, {initialState: combinedOrderInitialState}),
    StoreModule.forFeature('standalonePaymentState', standalonePaymentOrderReducer, {initialState: standalonePaymentInitialState}),
    StoreModule.forFeature('validateStoreLocation', storeLocationsReducer, {initialState: storeLocationInitialState}),
    StoreModule.forFeature('orderEmailStatus', orderEmailReducer, {initialState: orderEmailInitialState}),
    StoreModule.forFeature('checkoutState', checkoutStateReducer, {initialState: checkoutInitialState}),
    StoreModule.forFeature('cookieState', cookieStateReducer, {initialState: cookieInitialState}),
    StoreModule.forFeature('zoneState', zoneStateReducer, {initialState: zoneInitialState}),
    StoreModule.forFeature('currentCatState', currentCatStateReducer, {initialState: currentCatInitialState}),
    StoreModule.forFeature('storeRulesState', storeRulesReducer, {initialState: storeRulesInitialState}),
    StoreModule.forFeature('socialLoginState', socialLoginReducer, {initialState: socialLoginInitialState}),
    StoreModule.forFeature('customerDetailsUpdateState', customerDetailsUpdateReducer, {initialState: customerDetailsUpdateInitialState}),
    StoreModule.forFeature('customerLoyaltyState', customerLoyaltyReducer, {initialState: customerLoyaltyInitialState}),
    StoreModule.forFeature('currentPaymentsenseState', paymentSenseStateReducer, {initialState: paymentSenseInitialState}),
    StoreModule.forFeature('currentSquareState', squareStateReducer, {initialState: squareInitialState}),
    StoreModule.forFeature('currentTrustPaymentsState', trustPaymentsStateReducer, {initialState: trustPaymentsInitialState}),
    StoreModule.forFeature('currentJCCState', jccStateReducer, {initialState: jccInitialState}),
    StoreModule.forFeature('orderPaymentState', orderPaymentStateReducer, {initialState: orderPaymentInitialState}),
    StoreModule.forFeature('linkCodeState', linkCodeStateReducer, {initialState: linkCodeInitialState}),
    StoreModule.forFeature('storedCustomerState', storedCustomerStateReducer, {initialState: storedCustomerDataInitialState}),
    StoreModule.forFeature('globalPayState', globalPayStateReducer, {initialState: globalPayInitialState}),
    StoreModule.forFeature('rmsState', rmsStateReducer, {initialState: rmsInitialState}),
    StoreModule.forFeature('realexPaymentState', realexPaymentStateReducer, {initialState: realexPaymentInitialState}),
    StoreModule.forFeature('completePaymentState', completePaymentStateReducer, {initialState: completePaymentInitialState}),
    StoreModule.forFeature('storeRecents', storesRecentsReducer, STORERECENTS_CONFIG_TOKEN),
    StoreModule.forFeature('mobileStoreState', mobileStoreReducer, {initialState: mobileStoreInitialState}),
    StoreModule.forFeature('customerFooterHeightState', customerFooterReducer, {initialState: customerFooterHeightInitialState}),

    EffectsModule.forFeature([SelectedStoresEffects]),
    EffectsModule.forFeature([PaymentStoresEffects]),
    HttpClientModule,
    SharedModule,
    TimepickerModule.forRoot(),
    TextMaskModule,
    MatAutocompleteModule,
    MatIconModule,
    ...translation
  ],
  providers: [
    CookieService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: MAT_DATE_LOCALE, useValue: 'en-US'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    LocationService,
    CheckoutService,
    FormatPrice,
    BasketEnabledGuard,
    AdminBasketEnabledGuard,
    AdminStoreLoadingGuard,
    PaymentRedirectGuard,
    TrackingService,
    { provide: STORERECENTS_LOCAL_STORAGE_KEY, useValue: '__store_recents_storage__' },
    {
      provide: STORERECENTS_CONFIG_TOKEN,
      deps: [STORERECENTS_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getStoreRecentsConfig
    },
    ScriptLoaderService
  ],
})
export class PublicModule {
  constructor() {
    // detecting language
    document.documentElement.lang = window.navigator.language.split('-')[0];
  }
}
