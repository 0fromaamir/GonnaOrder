import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { ClientStore, LocationType, Order, OrderItem } from 'src/app/stores/stores';
import { LocationService } from '../../location.service';
import {
  getCombinedOrdersData,
  getCreatedStandaloneOrderData,
  getCurrentOrderStatus,
  getSelectedLang,
  getSelectedStore,
  getStoreLocations,
  getStoreLocationsState
} from '../+state/stores.selectors';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { WINDOW } from '../../window-providers';
import {
  CreateStandalonePayment,
  CustomerStandalonePaymentSearch,
  GetCombinedOrder,
  InitiateStandalonePayment,
  LoadCatalogLanguages,
  SelectCatalogLanguage,
  ValidateStoreLocations,
  ViewOrderStatus,
  ViewStateUpdateUserLanguage
} from '../+state/stores.actions';
import { HelperService } from '../../helper.service';
import { StandalonePaymentOrder } from '../types/StandalonePayment';
import { GetStatusOfZone, LoadZones } from 'src/app/stores/+state/stores.actions';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/local-storage.service';
import { PaymentMethod } from '../types/PaymentMethod';
import { RMSRequestJSON } from '../../payments/payment.types';
import { FormGroup } from '@angular/forms';
import { PaymentsenseService } from '../../payments/paymentsense.service';
import { SetGlobalPayRequestJson, SetRmsRequestJson } from '../../payments/+state/payment.actions';
import {TrustpaymentComponent} from "../../payments/trustpayment/trustpayment.component";
import {ApcopayComponent} from "../../payments/apcopay/apcopay.component";
import {PaymentService} from "../../payments/payment.service";

declare var RealexHpp;
@Component({
  selector: 'app-standalone-payment',
  templateUrl: './standalone-payment.component.html',
  styleUrls: ['./standalone-payment.component.scss']
})
export class StandalonePaymentComponent implements OnInit, OnDestroy {
  backToCurrentCat: number;
  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderItems: OrderItem[] = [];
  order: Order;
  selectedLang: string;
  paymentData: StandalonePaymentOrder;
  currencySymbol: string;
  showTable: boolean;
  showOrderToken: boolean;
  storeLocationType: string;
  langLoaded = false;
  lang: string;
  isAmountRemaining = true;
  openStandalonePaymentOrder: StandalonePaymentOrder;
  paidOrders: StandalonePaymentOrder;
  locationData;
  error: boolean;
  requestJSON: any;
  jccRequestJSON: any;
  jccServerLink: string;
  jccCardForm: FormGroup;
  @ViewChild('jccForm') jccForm: ElementRef;
  isJccPay = false;
  isAmountReferenceOrder = false;
  errorOrders: boolean;
  @ViewChild('trustpaymentComponent') trustpaymentComponent: TrustpaymentComponent;
  @ViewChild('apcopayComponent') apcopayComponent: ApcopayComponent;

  constructor(
    private store: Store<any>,
    private router: Router,
    private locationService: LocationService,
    private helper: HelperService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<any>,
    private storageService: LocalStorageService,
    @Inject(WINDOW) private window: Window,
    private paymentsenseService: PaymentsenseService,
    private paymentService: PaymentService
  ) {
  }

  ngOnInit(): void {
    const queryParams = this.getParamsFromURL();
    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore),
      filter(l => {
        return l !== null && l.id && l.id > 0;
      }),
      tap(_ => this.store.dispatch(new LoadZones())),
      tap(_ => this.store.dispatch(new GetStatusOfZone())),
    );
    this.selectedStore$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.currencySymbol = value.currency.symbol;
        this.selectedStore = value;
        this.store.dispatch(new SelectCatalogLanguage('en', {
          src: 'StandAlonePaymentComponent',
          description: 'Selected store loaded'
        }));
        if (this.selectedStore.id) {
          this.store.dispatch(new LoadCatalogLanguages(this.selectedStore.id));
          if (queryParams.parameterName === 'orderToken') {
            this.showOrderToken = true;
            this.showTable = false;
            this.store.dispatch(new ViewOrderStatus(this.selectedStore.id
              , queryParams.parameterValue
              , 'CHECKEXISTING'
              , this.selectedLang
            ));
          } else if (queryParams.parameterName === 'l') {
            this.showOrderToken = false;
            this.showTable = true;
            this.store.dispatch(new GetCombinedOrder(this.selectedStore.id, queryParams.parameterValue));
          } else if (queryParams.parameterName === 'amount') {
            this.isAmountReferenceOrder = true;
            this.createAmountReferenceOrder(queryParams.parameterValue);
          }
        }
      });

    combineLatest([
      this.store.select(getCurrentOrderStatus),
      this.store.select(getCombinedOrdersData)
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([currOrder, combinedOrder]) => {
        if (currOrder || combinedOrder) {
          if (queryParams.parameterName === 'orderToken' && currOrder.status === 'LOADED') {
            this.store.dispatch(new CustomerStandalonePaymentSearch(currOrder.data.storeId, queryParams.parameterValue, null, null));
          } else if (queryParams.parameterName === 'l' && combinedOrder.status === 'LOADED') {
            this.store.dispatch(
              new CustomerStandalonePaymentSearch(
                this.selectedStore.id,
                null,
                queryParams.parameterValue,
                combinedOrder.data.tapId.toString())
            );
          } else if (
            combinedOrder.status === 'FAILED' &&
            combinedOrder.errorCode) {
            this.isAmountRemaining = false;
            if (combinedOrder.errorCode === 'ORDER_WITH_VOUCHER_NOT_SUPPORTED') {
              this.error = true;
            } else if (combinedOrder.errorCode === 'ORDER_NOT_FOUND') {
              this.errorOrders = true;
            }
          }
        }
      });

    combineLatest([
      this.store.select(getCreatedStandaloneOrderData),
      this.store.select(getCurrentOrderStatus),
      this.store.select(getCombinedOrdersData)
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([state, currOrder, combinedOrder]) => {
        if (state.status === 'LOADED' || state.status === 'ITEMUPDATED') {
          this.paymentData = state.data;
          this.paymentData.locale = this.selectedStore.address.country.defaultLocale
            + '-'
            + this.selectedStore.address.country.code;
          this.paymentData.currencyIsoCode = this.selectedStore.currency.isoCode;
          this.paymentData.currencySymbol = this.selectedStore.currency.symbol;
          if (queryParams.parameterName === 'amount') {
            this.storageService.setSavedState(state.data.id + '/' + state.data.storeId, 'standalone-amount');
            this.storageService.setSavedState(queryParams.parameterValue, 'sp-amount');
          }
          if (queryParams.parameterName === 'l') {
            this.storageService.setSavedState(state.data.id, 'standalone-id');
          }
        } else if (state.status === 'INITIATE_PAYMENT_SUCCESS') {

          if (state.data?.paymentFormParams?.providerPaymentType && state.data?.paymentFormParams?.providerPaymentType === 'PHYSICAL') {
            this.setPhysicalPaymentDetails(state.data);
            this.window.location.href = window.location.origin + '/standalone-payment/standalone-payment-progress';
            return;
          }
          if ( state.data.paymentMethod === PaymentMethod.CREDIT_CARD_HOBEX) {
            this.setPaymentPayDetails(state.data);
            this.window.location.href = window.location.origin + '/standalone-payment/standalone-payment-pay';
            return;
          }

          if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_VIVA) {
            let storeId = (currOrder?.data?.storeId ?? combinedOrder?.data?.storeId ?? '');
            let storeAlias = (currOrder?.data?.storeAliasName ?? combinedOrder?.data?.storeAliasName ?? '');
            if (queryParams.parameterName === 'amount') {
              storeId = this.selectedStore.id;
              storeAlias = this.selectedStore.aliasName;
            }
            window.location.href = environment.adminHostURL + '/payment-routing/viva?ordercode='
              + (state.data.paymentProviderIdentifier || null)
              + '&url=' + encodeURIComponent(window.location.origin + '/standalone-payment/standalone-payment-error')
              + '&storeAliasName=' + storeAlias
              + '&orderUuid=' + state.data.id
              + '&storeId=' + storeId
              + '&thankUrl=' + encodeURIComponent(window.location.origin + '/standalone-payment/standalone-payment-success');
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_FYGARO) {
            let storeId = (currOrder?.data?.storeId ?? combinedOrder?.data?.storeId ?? '');
            let storeAlias = (currOrder?.data?.storeAliasName ?? combinedOrder?.data?.storeAliasName ?? '');
            if (queryParams.parameterName === 'amount') {
              storeId = this.selectedStore.id;
              storeAlias = this.selectedStore.aliasName;
            }
            window.location.href = environment.adminHostURL + '/payment-routing/fygaro?jwt='
              + (state.data?.paymentFormParams?.jwt || null)
              + '&url=' + encodeURIComponent(window.location.origin + '/standalone-payment/standalone-payment-error')
              + '&storeAliasName=' + storeAlias
              + '&orderUuid=' + state.data.id
              + '&storeId=' + storeId
              + '&callbackUrl=' + state.data?.paymentFormParams?.callbackUrl
              + '&checkoutUrl='+ state.data.checkoutUrl;
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_EPAY) {
            let storeId = (currOrder?.data?.storeId ?? combinedOrder?.data?.storeId ?? '');
            let storeAlias = (currOrder?.data?.storeAliasName ?? combinedOrder?.data?.storeAliasName ?? '');
            if (queryParams.parameterName === 'amount') {
              storeId = this.selectedStore.id;
              storeAlias = this.selectedStore.aliasName;
            }
            window.location.href = environment.adminHostURL + '/payment-routing/epay?checkoutUrl='
              + ( state.data?.checkoutUrl || null)
              + '&url=' + encodeURIComponent(window.location.origin + '/standalone-payment/standalone-payment-error')
              + '&storeAliasName=' + storeAlias
              + '&orderUuid=' + state.data.id
              + '&storeId=' + storeId
              + '&callbackUrl=' + state.data?.paymentFormParams?.responseUrl
              + '&acquirerId='+ state.data?.paymentFormParams?.acquirerId
              + '&merchantId='+ state.data?.paymentFormParams?.merchantId
              + '&posId='+ state.data?.paymentFormParams?.posId
              + '&user='+ state.data?.paymentFormParams?.username
              + '&languageCode='+ state.data?.paymentFormParams?.languageCode
              + '&merchantReference='+ state.data?.paymentFormParams?.merchantReference
              + '&parameters='+ state.data?.paymentFormParams?.parameters;
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_JCC) {
            this.isJccPay = true;
            this.jccRequestJSON = state.data.paymentFormParams;
            if (this.jccForm.nativeElement) {
              this.jccServerLink = environment.name === 'production' ?
                'https://jccpg.jccsecure.com/EcomPayment/RedirectAuthLink'
                : 'https://tjccpg.jccsecure.com/EcomPayment/RedirectAuthLink';
              setTimeout(_ => this.jccForm.nativeElement?.submit(), 10);
            }
            this.setSpType(queryParams.parameterName, queryParams.parameterValue);
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_RMS) {
            this.store.dispatch(new SetRmsRequestJson(state.data));
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_GLOBALPAY) {
            this.store.dispatch(new SetGlobalPayRequestJson(state.data));
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_TRUSTPAYMENTS) {
            this.trustpaymentComponent.submitForm(state.data);
          } else if (state.data.paymentMethod === PaymentMethod.CREDIT_CARD_PAYMENTSENSE) {
            this.paymentsenseService.handlePaymentSenseFlow(this.store, state.data, true);
          } else if(state.data.paymentMethod === PaymentMethod.CREDIT_CARD_APCOPAY) {
            this.apcopayComponent.submitForm(state.data);
          }
          else {
            this.window.location.href = state.data.checkoutUrl;
          }
        } else if (state.status === 'INITIATE_PAYMENT_FAILED') {
          this.window.location.href = window.location.origin + '/standalone-payment/standalone-payment-error';
        } else if (state.status === 'ITEMSEARCHSUCCESS') {
          this.isAmountRemaining = state.openBalance === 0 && state.standalonePaymentOrders && state.standalonePaymentOrders.length !== 0 ?
            false : true;
          this.openStandalonePaymentOrder = state.openStandalonePaymentOrder;
          if (state.standalonePaymentOrders && state.standalonePaymentOrders.length > 0) {
            this.paidOrders = state.standalonePaymentOrders[0];
          }
          if (currOrder && queryParams.parameterName === 'orderToken') {
            this.storageService.setSavedState(queryParams.parameterValue, 'standalone-order');
            this.storageService.removeSavedState('standalone-location');
            this.storageService.removeSavedState('standalone-id');
            this.storageService.removeSavedState('standalone-amount');
            this.orderTokenCreate(queryParams, currOrder);
          }
          if (queryParams.parameterName === 'l') {
            this.storageService.setSavedState(queryParams.parameterValue, 'standalone-location');
            this.storageService.removeSavedState('standalone-order');
            this.storageService.removeSavedState('standalone-amount');
            this.locationOrderCreate(queryParams, combinedOrder);
          }
        }
      });

    this.store.select(getStoreLocationsState).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.storeLocationType = state?.locationType;
      });

    this.store.select(getSelectedLang)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedLang = value;
      });

    this.loadLanguage(this.translate.getBrowserLang())
      .catch(_ => {
        this.loadLanguage('en');
        this.langLoaded = true;
      });
    this.store.select(getStoreLocations).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.storeLocationsState.status === 'LOADED') {
          this.locationData = state.storeLocationsState.locationState;
        }
      });
  }

  createAmountReferenceOrder(amountReference: string) {
    this.store.dispatch(new CreateStandalonePayment(
      this.selectedStore.id,
      undefined,
      undefined,
      this.helper.getDeviceID(),
      Number(amountReference)
    ));
  }

  locationOrderCreate(queryParams, state) {
    if (queryParams.parameterName === 'l' && state.status === 'LOADED') {
      this.orderItems = state.data.orderItems;
      this.order = state.data;
      this.store.dispatch(new ValidateStoreLocations(this.selectedStore.id, this.order.location));
      if (
        (this.openStandalonePaymentOrder === null ||
          this.openStandalonePaymentOrder?.location.toString() !== queryParams.parameterValue ||
          this.openStandalonePaymentOrder.amountReference !== state.data.totalDiscountedPrice) &&
        this.isAmountRemaining
      ) {
        this.store.dispatch(new CreateStandalonePayment(
          this.selectedStore.id,
          undefined,
          queryParams.parameterValue,
          this.helper.getDeviceID(),
          this.order.totalDiscountedPrice
        ));
      } else {
        if (this.openStandalonePaymentOrder) { this.paymentData = this.openStandalonePaymentOrder; }
        else if (this.paidOrders) { this.paymentData = this.paidOrders; }
        if (this.paymentData) {
          this.paymentData.locale = this.selectedStore.address.country.defaultLocale
            + '-'
            + this.selectedStore.address.country.code;
          this.paymentData.currencyIsoCode = this.selectedStore.currency.isoCode;
          this.paymentData.currencySymbol = this.selectedStore.currency.symbol;
        }
      }
    } else if (queryParams.parameterName === 'l' && state.status === 'FAILED') {
      let backUrl = '';
      if (this.backToCurrentCat) {
        backUrl = `category/${this.backToCurrentCat}`;
      }
      this.router.navigateByUrl(this.locationService.base_url(backUrl));
    }
  }

  orderTokenCreate(queryParams, state) {
    if (queryParams.parameterName === 'orderToken' && state.status === 'LOADED') {
      this.orderItems = state.data.orderItems;
      this.order = state.data;
      if ((this.openStandalonePaymentOrder === null ||
        this.openStandalonePaymentOrder?.order !== queryParams.parameterValue ||
        this.openStandalonePaymentOrder.amountReference !== state.data.totalDiscountedPrice) && this.isAmountRemaining
      ) {
        this.store.dispatch(new CreateStandalonePayment(
          this.selectedStore.id,
          queryParams.parameterValue,
          undefined,
          this.helper.getDeviceID(),
          this.order.totalDiscountedPrice
        ));
      } else {
        if (this.openStandalonePaymentOrder) { this.paymentData = this.openStandalonePaymentOrder; }
        else if (this.paidOrders) { this.paymentData = this.paidOrders; }
        if (this.paymentData) {
          this.paymentData.locale = this.selectedStore.address.country.defaultLocale
            + '-'
            + this.selectedStore.address.country.code;
          this.paymentData.currencyIsoCode = this.selectedStore.currency.isoCode;
          this.paymentData.currencySymbol = this.selectedStore.currency.symbol;
        }
      }
    } else if (queryParams.parameterName === 'orderToken' && state.status === 'FAILED') {
      let backUrl = '';
      if (this.backToCurrentCat) {
        backUrl = `category/${this.backToCurrentCat}`;
      }
      this.router.navigateByUrl(this.locationService.base_url(backUrl));
    }
  }

  getParamsFromURL() {
    let parameterName;
    let parameterValue;
    // if (url.split('/')[1] && url.split('/')[2]) {
    //   parameterName = url.split('/')[1];
    //   parameterValue = url.split('/')[2];
    // }
    this.route.params.subscribe(val => {
      parameterName = Object.keys(val)[0];
      parameterValue = Object.values(val)[0];
    });
    return {
      parameterName,
      parameterValue
    };
  }

  onGoBack(event) {
    event.preventDefault();
    let url = window.location.origin;
    const queryParams = this.getParamsFromURL();
    if (queryParams.parameterName === 'l' && this.locationData) {
      url = `/#l/${this.locationData.label}`;
    }
    this.router.navigateByUrl(url);
  }

  isShowParentItemPrice(orderItem: OrderItem) {
    if (orderItem.quantity > 1
      || (orderItem.discountValue !== undefined
        && orderItem.discountValue > 0)) {
      return true;
    }
    if (orderItem.childOrderItems !== undefined
      && orderItem.childOrderItems.length > 0) {
      let found = false;
      orderItem.childOrderItems.forEach(childOrderItem => {
        if (childOrderItem.offerPrice !== undefined
          && childOrderItem.offerPrice !== 0) { // Showing up the Item price if Child price is + or -
          found = true;
        }
      });
      return found;
    }
    return false;
  }

  shouldDisplayTotal() {
    if (this.orderItems) {
      for (const item of this.orderItems) {
        if (item.totalNonDiscountedPrice !== 0) { return true; }
      }
      return (this.getCartTotal() === 0) ? false : true;
    } else {
      return false;
    }
  }

  getCartTotal() {
    let ret = 0;
    if (this.orderItems) {
      this.orderItems.forEach(item => {
        ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
      });
    }
    return ret;
  }

  public get LocationType(): typeof LocationType {
    return LocationType;
  }

  getSubdomain(): string {
    const domain = this.window.location.hostname;

    if (domain.indexOf(environment.envDomain) < 0) {
      return domain;
    }

    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      return '';
    }
    return domain.split('.')[0];
  }

  private loadLanguage(locale) {
    return import(`./../../translations/i18n/translation.${locale}.json`)
      .then(lang => {
        this.translate.setTranslation(locale, { ...lang });
        this.translate.setDefaultLang(locale);

        this.langLoaded = true;
        switch (locale) {
          case 'en':
          case 'fr':
          case 'nl':
          case 'el':
          case 'ja':
            this.lang = locale;
            break;
          default:
            this.lang = 'en';
        }
        // set datepicker locale with user language
        if (this.lang) {
          this.dateAdapter.setLocale(this.lang);
        }
        // store user language to view state...
        this.store.dispatch(new ViewStateUpdateUserLanguage(this.lang, {
          src: 'StandAlonePaymentComponent',
          description: 'Load language'
        }));
      });
  }

  proceedToPayment(event) {
    if (event) {
      event.preventDefault();
    }
    this.store.dispatch(new InitiateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, this.paymentService.getOriginType(), this.paymentService.getOriginDomain()));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setSpType(parameterName, parameterValue) {
    if (parameterName === 'amount') {
      this.storageService.setSavedState(parameterValue, 'sp-amount');
      this.storageService.removeSavedState('standalone-location');
      this.storageService.removeSavedState('standalone-id');
      this.storageService.removeSavedState('standalone-order');
    } else if (parameterName === 'orderToken') {
      this.storageService.setSavedState(parameterValue, 'standalone-order');
      this.storageService.removeSavedState('standalone-location');
      this.storageService.removeSavedState('standalone-id');
      this.storageService.removeSavedState('sp-amount');
    } else if (parameterName === 'l') {
      this.storageService.setSavedState(parameterValue, 'standalone-location');
      this.storageService.removeSavedState('standalone-order');
      this.storageService.removeSavedState('sp-amount');
    }
  }


  private setPhysicalPaymentDetails(data) {
    const physicalPaymentDetails = {
      'orderId': data?.paymentFormParams?.orderId,
      'storeId': data?.paymentFormParams?.storeId,
      'isStandalonePayment': true,
      'redirectUrl': data?.paymentFormParams?.responseUrl
    };
    this.storageService.setSavedState(JSON.stringify(physicalPaymentDetails), 'physicalPaymentDetails');
  }

  private setPaymentPayDetails(data) {
    const paymentPayDetails = {
      'requestJSON': data,
      'isStandalonePayment': true,
      'selectedStore': this.selectedStore,
    }
    this.storageService.setSavedState(JSON.stringify(paymentPayDetails), 'paymentPayDetails');
  }
}
