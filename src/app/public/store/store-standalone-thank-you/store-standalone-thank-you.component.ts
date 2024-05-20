import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid } from 'src/app/stores/stores';
import { SelectedStoreState, OrderMetaData, CartState } from '../+state/stores.reducer';
import { Store } from '@ngrx/store';
import {
  getSelectedStore,
  getCurrentOrderStatus,
  getStoreLocationsState,
  getSelectedLang,
  getCombinedOrdersData,
  getCreatedStandaloneOrderData,
  getOrderEmailStatus
} from '../+state/stores.selectors';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import {
  ViewOrderStatus,
  InitializeOrder,
  ClearOrderMeta,
  ClearCheckoutState,
  ClearZonePerZipcode,
  ClearOrderByEmail,
  FetchSlots,
  ViewStateUpdateUserLanguage,
  GetCombinedOrder,
  SendStandaloneOrderByEmail
} from '../+state/stores.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../location.service';
import { TranslateService } from '@ngx-translate/core';
import { CheckoutService, EMAIL_STATUS } from '../store-checkout/checkout.service';
import { HelperService } from '../../helper.service';
import { Platform } from '@angular/cdk/platform';
import { environment } from 'src/environments/environment';
import { DateAdapter } from '@angular/material/core';
import { LocalStorageService } from 'src/app/local-storage.service';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { StandalonePaymentOrder } from '../types/StandalonePayment';

@Component({
  selector: 'app-store-standalone-thank-you',
  templateUrl: './store-standalone-thank-you.component.html',
  styleUrls: ['./store-standalone-thank-you.component.scss']
})
export class StoreStandaloneThankYouComponent implements OnInit, OnDestroy {
  emailConfirmationFG: FormGroup;
  selectedStore: ClientStore;
  selectedLang: string;
  orderStatus: CartState;
  cartState: Order;
  unsubscribe$: Subject<void> = new Subject<void>();
  interval = 5000; // ms
  timer: any = null;
  validLocations: LocationValid = null; // not in use
  validLocation: number | string = null;
  paymentMethodsAfterTheFactObj = {};
  paymentMethodsAfterTheFact = [];
  numPaymentMethodsAfterTheFact = 0;
  isPos = false;
  innerHeight = 500;
  langLoaded = false;
  lang: string;
  locationLabel;
  isAmountRemaining: boolean;
  remainingBalance: string;
  redirectionUrl: string;
  paymentData: StandalonePaymentOrder;
  emailStatus = -1;

  @HostListener('window:resize', ['$event'])
  @HostListener('window:scroll', ['$event'])
  onResize(event) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  constructor(
    private store: Store<SelectedStoreState>,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private locationService: LocationService,
    public helper: HelperService,
    private translate: TranslateService,
    private platform: Platform,
    private checkoutService: CheckoutService,
    private dateAdapter: DateAdapter<any>,
    private storageService: LocalStorageService
  ) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {
    this.setEmailStatus(EMAIL_STATUS.UNDEFINED);
    this.store.select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedStore = value;
        if (this.selectedStore.settings) {
          Object.keys(this.selectedStore.settings)
            .filter(setting => setting.match(/(POST_ORDER_PAYMENT_LINK_)([A-Z]+)*/))
            .map(key => {
              const provider: any = /(POST_ORDER_PAYMENT_LINK_)([A-Z]+)_([A-Z]+)*/g.exec(key)[2];
              const property: any = /(POST_ORDER_PAYMENT_LINK_)([A-Z]+)_([A-Z]+)*/g.exec(key)[3];
              if (!this.paymentMethodsAfterTheFactObj[provider]) {
                this.paymentMethodsAfterTheFactObj[provider] = {};
                this.paymentMethodsAfterTheFactObj[provider].method = provider;
              }
              this.paymentMethodsAfterTheFactObj[provider][property] = this.selectedStore.settings[key];
              if (property === 'ENABLED' && this.selectedStore.settings[key] === true) {
                this.numPaymentMethodsAfterTheFact++;
              }
            });
          this.paymentMethodsAfterTheFact = Object.values(this.paymentMethodsAfterTheFactObj);
        }
      });

    combineLatest([this.store.select(getCurrentOrderStatus), this.store.select(getStoreLocationsState), this.store.select(getSelectedLang)])
      .pipe(
        // disabling the following line as this prevents polling when there is payment(order status is draft in this case)
        // filter(state => !!state && !!state[0] && !!state[0].data && state[0].data.status !== 'DRAFT'),
        filter(state => !!state && !!state[0]),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(state => {
        this.orderStatus = state[0];
        this.cartState = this.orderStatus.data;
        if (this.cartState && this.cartState.location) {
          this.validLocation = this.cartState.location;
        }
        // map the status

        if (
          this.orderStatus && this.orderStatus.data &&
          (
            this.orderStatus.data.status === 'SUBMITTED' ||
            this.orderStatus.data.status === 'RECEIVED' ||
            this.orderStatus.data.status === 'DRAFT'
          )
        ) {
          this.startStatusListener();
        } else {
          this.stopStatusListener();
        }
        if (state[1]) {
          this.validLocations = state[1];
        }
        if (state[2]) {
          this.selectedLang = state[2];
        }
      });

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate') {
          this.onGoToDashboard();
        }
      });
    this.isPos = this.router.url.includes('/capture/');

    this.loadLanguage(this.translate.getBrowserLang())
      .catch(_ => {
        this.loadLanguage('en');
        this.langLoaded = true;
      });
    const standaloneLocation: string = this.storageService.getSavedState('standalone-location');
    if (standaloneLocation) {
      this.store.dispatch(new GetCombinedOrder(this.selectedStore.id, standaloneLocation));
    }
    this.store.select(getCombinedOrdersData).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.status === 'LOADED') {
          this.locationLabel = state.data.location;
        }
      });
    this.store.select(getCreatedStandaloneOrderData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        if (state.status === 'ITEMSEARCHSUCCESS' || state.status === 'COMPLETE_PAYMENT_SUCCESS') {
          this.paymentData = state.data;
          if (state.data.location) {
            this.redirectionUrl = '/standalone-payment/l/' + state.data.location;
          } else if (state.data.order) {
            this.redirectionUrl = '/standalone-payment/orderToken/' + state.data.order;
          }
          this.isAmountRemaining = false;
          if (state?.openBalance) {
            this.isAmountRemaining = state.openBalance === 0 && state?.standalonePaymentOrders &&
            state.standalonePaymentOrders.length !== 0 ?
            false : true;
          }
          this.remainingBalance = state.formattedOpenBalance;
        }
      });

    this.store.select(getOrderEmailStatus)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state.orderEmail.status === 'SENDING') {
          this.setEmailStatus(EMAIL_STATUS.SENDING);
        }
        if (state && state.orderEmail.status === 'SENT') {
          this.setEmailStatus(EMAIL_STATUS.SUCCESS);
        }
        if (state && state.orderEmail.status === 'FAILED') {
          this.setEmailStatus(EMAIL_STATUS.FAILED);
        }
      }
      );
    this.emailConfirmationFG = this.fb.group({
      email: ['', Validators.compose([CustomValidators.email, Validators.maxLength(40)])]
    });
  }

  setEmailStatus(status) {
    if (Object.values(EMAIL_STATUS).includes(status)) {
      this.emailStatus = status;
    }
  }

  onSubmitOrderOnEmail() {
    if (this.emailConfirmationFG.invalid) {
      this.getControl('email').markAsTouched();
      return;
    }
    if (this.getControl('email').value !== '') {
      if (this.paymentData) {
        this.store.dispatch(new SendStandaloneOrderByEmail(
          this.paymentData.storeId,
          this.paymentData.id,
          this.getControl('email').value
        ));
      } else {
        this.store.dispatch(new SendStandaloneOrderByEmail(
          this.selectedStore.id.toString(),
          this.storageService.getSavedState('standalone-id'),
          this.getControl('email').value
        ));
      }
      this.getControl('email').setValue('');
      this.getControl('email').updateValueAndValidity();
    }
  }

  getControl(name: string, form: string = 'emailConfirmationFG') {
    return this[form].get(name);
  }

  private startStatusListener() {
    if (this.timer === null) {
      this.timer = setInterval(() => {
        if (this.selectedStore && this.orderStatus) {
          this.store.dispatch(new ViewOrderStatus(
            this.selectedStore.id,
            this.orderStatus.data.uuid,
            'CHECKEXISTING',
            this.selectedLang,
          ));
        }
      }, this.interval);
    }
  }

  private stopStatusListener() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }


  onGoToDashboard(event?) {
    if (event) {
      event.preventDefault();
    }
    this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
    this.locationService.setOrderUuid('');
    let url = window.location.origin;
    const standaloneLocation: string = this.storageService.getSavedState('standalone-location');
    if (standaloneLocation && this.locationLabel) {
      url = `/#l/${this.locationLabel}`;
    }
    this.router.navigateByUrl(url);
  }

  payMore() {
    this.router.navigateByUrl(this.redirectionUrl);
  }

  getInitOrder() {
    const order: Order = {
      orderItems: []
    };
    if (this.checkoutService.ifOnlyInStore()) {
      order.deliveryMethod = 'IN_STORE_LOCATION';
    } else if (this.checkoutService.ifOnlySelfPickup()) {
      order.deliveryMethod = 'NO_LOCATION';
    } else if (this.checkoutService.ifOnlyDeliveryToAddress()) {
      order.deliveryMethod = 'ADDRESS';
    } else if (
      this.selectedStore.settings.DEFAULT_DELIVERY_MODE &&
      this.checkoutService.ifDeliveryMethodEnabled(this.selectedStore.settings.DEFAULT_DELIVERY_MODE)
    ) {
      order.deliveryMethod = this.selectedStore.settings.DEFAULT_DELIVERY_MODE;
    }
    this.store.dispatch(new ClearOrderMeta({}));
    this.store.dispatch(new ClearCheckoutState());
    this.store.dispatch(new ClearZonePerZipcode());
    this.store.dispatch(new ClearOrderByEmail());
    this.store.dispatch(new FetchSlots(this.selectedStore.id, order.deliveryMethod, null, {
      src: 'StoreStandaloneThankYouComponent',
      description: 'Init order'
    }));
    return order;
  }


  shouldDisplayAppLinks() {
    return (this.shouldDisplayAppStore() || this.shouldDisplayPlayStore());
  }

  shouldDisplayPlayStore() {
    if (this.isAndroid() && (this.selectedStore.settings.PROMOTE_GONNAORDER_APP || this.selectedStore.settings.PROMOTE_STORE_APP)) {
      return true;
    } else {
      return false;
    }
  }

  shouldDisplayAppStore() {
    if (this.isIOS() && (this.selectedStore.settings.PROMOTE_GONNAORDER_APP || this.selectedStore.settings.PROMOTE_STORE_APP)) {
      return true;
    } else {
      return false;
    }
  }

  isAndroid() {
    return this.platform.ANDROID;
  }

  isIOS() {
    return this.platform.IOS;
  }

  onClickGooglePlay() {
    if (this.selectedStore && this.selectedStore.aliasName && this.selectedStore.settings) {
      let targetAppUrl = '';
      let targetDeeplinkUrl = '';
      if (this.selectedStore.settings.PROMOTE_GONNAORDER_APP) {
        targetAppUrl = environment.defaultDeeplinkAppAndroidUrl + (environment.defaultDeeplinkAppAndroidUrl.includes('?')) ? '&' : '?' + `referrer=${this.selectedStore.aliasName}`;
        targetDeeplinkUrl = `${environment.defaultDeeplinkAppId}://localhost/public/customer/store/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        window.location.href = targetDeeplinkUrl;
      } else if (this.selectedStore.settings.PROMOTE_STORE_APP && this.selectedStore.settings.STORE_APP_ANDROID_URL) {
        targetAppUrl = this.selectedStore.settings.STORE_APP_ANDROID_URL;
        // Disabled deeplink as backend is not ready yet...
        // targetDeeplinkUrl =
        //   `${this.selectedStore.settings.STORE_APP_ANDROID_APPID}://localhost/public/template/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        // window.location.href = targetDeeplinkUrl;
      }
    }
  }

  onClickAppStore() {
    if (this.selectedStore && this.selectedStore.aliasName) {
      let targetAppUrl = '';
      let targetDeeplinkUrl = '';
      if (this.selectedStore.settings.PROMOTE_GONNAORDER_APP) {
        targetAppUrl = environment.defaultDeeplinkAppIOSUrl + (environment.defaultDeeplinkAppIOSUrl.includes('?')) ? '&' : '?' + `referrer=${this.selectedStore.aliasName}`;
        targetDeeplinkUrl = `${environment.defaultDeeplinkAppId}://localhost/public/customer/store/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        window.location.href = targetDeeplinkUrl;
      } else if (this.selectedStore.settings.PROMOTE_STORE_APP && this.selectedStore.settings.STORE_APP_IOS_URL) {
        targetAppUrl = this.selectedStore.settings.STORE_APP_IOS_URL;
        // Disabled deeplink as backend is not ready yet...
        // targetDeeplinkUrl =
        //   `${this.selectedStore.settings.STORE_APP_IOS_APPID}://localhost/public/template/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        // window.location.href = targetDeeplinkUrl;
      }
    }
  }

  ngOnDestroy() {
    this.stopStatusListener();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
          src: 'StoreStandaloneThankYouComponent',
          description: 'Update user language'
        }));
      });
  }


}
