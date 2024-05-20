import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid } from 'src/app/stores/stores';
import { SelectedStoreState, OrderMetaData, CartState } from '../+state/stores.reducer';
import { Store } from '@ngrx/store';
import { getSelectedStore, getCurrentOrderStatus, getStoreLocationsState, getSelectedLang } from '../+state/stores.selectors';
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
  ViewStateUpdateUserLanguage
} from '../+state/stores.actions';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocationService } from '../../location.service';
import { TranslateService } from '@ngx-translate/core';
import { CheckoutService } from '../store-checkout/checkout.service';
import { HelperService } from '../../helper.service';
import { Platform } from '@angular/cdk/platform';
import { environment } from 'src/environments/environment';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-store-standalone-error',
  templateUrl: './store-standalone-error.component.html',
  styleUrls: ['./store-standalone-error.component.scss']
})
export class StoreStandaloneErrorComponent implements OnInit, OnDestroy {

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
  ) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {
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
    this.router.navigate([this.locationService.base_url(window.location.origin)]);
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
      src: 'StoreStandaloneErrorComponent',
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
          src: 'StoreStandaloneErrorComponent',
          description: 'Update user language'
        }));
      });
  }


}
