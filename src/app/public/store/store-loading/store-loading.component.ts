import { DOCUMENT } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute, Router, Scroll } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject, combineLatest } from 'rxjs';
import { delay, filter, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { ClientStore, Lang, Order, StoreViewState } from 'src/app/stores/stores';
import {
  AcceptCookie,
  CheckExistingOrder,
  ErrorMessage,
  FetchSlots,
  GetStoreRules,
  InitializeOrder,
  LoadCatalog,
  LoadCatalogLanguages,
  RejectCookie,
  SelectCatalogLanguage,
  UpdateOrderWish,
  ViewStateUpdateUserLanguage,
} from '../+state/stores.actions';
import { CatalogState } from '../+state/stores.reducer';
import {
  getAvailableCatalogLanguages,
  getCartState,
  getCatalogState,
  getCookieState,
  getCurrentCartStatus,
  getCurrentCartUuid,
  getCurrentOrderMetaState,
  getCurrentStoreViewStatus,
  getCustomerFooterHeight,
  getLoadedCatalogLanguage,
  getOrderWish,
  getSelectedCategory,
  getSelectedLang,
  getSelectedStore,
  getSelectedStoreStatus,
  getStoreOpeningInfo
} from '../+state/stores.selectors';
import { HelperService } from '../../helper.service';
import { LocationService } from '../../location.service';
import { TrackingService } from '../../tracking.service';
import { WINDOW } from '../../window-providers';
import { CheckoutService } from '../store-checkout/checkout.service';
import {StoresService} from '../../../stores/stores.service';
declare const fbq: any;
@Component({
  selector: 'app-store-loading',
  templateUrl: './store-loading.component.html',
  styleUrls: ['./store-loading.component.scss']
})
export class StoreLoadingComponent implements OnInit, OnDestroy, DoCheck {

  catalogLoaded: boolean;
  storeViewState$: Observable<StoreViewState>;
  store$: Observable<ClientStore>;
  cartState: Order;
  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStore: ClientStore;
  availableCatalogLanguages: Lang[];
  selectedCategory: number;
  loadedCatalogLang: string;
  selectedLang: string;
  loadView: string;
  cookieEnabled = false;
  ulang: string;  // query param user language - overrides the user language preference in the browser
  clang: string;  // query param catalog lanugage - overrides the store default lanugage (if exitsts for store)
  wish: string;  // query param wish day
  langLoaded = false;
  isPos = false;
  showCookieMessage = false;
  lang: string;
  cookieBarHeight = 0;
  storeOpeningInfo = null;
  currentPopUpFrom: string;
  isAdminOrderUpdate = false;
  fbMetaContentLoaded = false;
  userInterfaceLanguageOption = '';
  userInterfaceLanguages: any[];
  customerFooterHeight: number;

  @ViewChild('cookieBar') cookieBar: ElementRef;
  @ViewChild('readMoreSelectorModal') readMoreModal: ElementRef;
  catalogLanguage = '';
  constructor(
    private store: Store<CatalogState>,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private locationService: LocationService,
    private helper: HelperService,
    private cd: ChangeDetectorRef,
    private checkoutService: CheckoutService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private dateAdapter: DateAdapter<any>,
    private trackingService: TrackingService,
    @Inject(DOCUMENT) private document: any,
    @Inject(WINDOW) private window: Window,
    private storesService: StoresService,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService
  ) {
    this.router.events.forEach((event) => {
      if (event instanceof Scroll) {
        // the loadView must be called after all store info has finished loading
        this.locationService.loadView(event.anchor);
        this.loadView = event.anchor;
      }
    });
    this.isAdminOrderUpdate = this.locationService.isAdminOrderUpdate();
  }

  ngDoCheck() {
    this.calcCookieBarHeight();
  }

  calcCookieBarHeight() {
   if (this.cookieBar && this.cookieBar.nativeElement) {
     this.cookieBarHeight = this.cookieBar.nativeElement.offsetHeight;
   }
  }

  private loadLanguage(locale) {
    return import(`./../../translations/i18n/translation.${locale}.json`)
      .then(lang => {
        this.translate.setTranslation(locale, {...lang});
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
          src: 'StoreLoadingComponent',
          description: 'Load language file and set user language to view state'
        }));
      });
  }

  ngOnInit() {
    const preferredBrowserLanguages = window.navigator.languages;
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);
    // calculate view port height
    this.calcViewPortHeight();
    // check cookies
    this.cookieEnabled = this.cookiesEnabled();
    // subscribe to query params for languages & wish day
    this.route.fragment
      .pipe(
        withLatestFrom(this.store.select(getOrderWish)),
        takeUntil(this.unsubscribe$)
      ).subscribe(([f, wishDate]) => {

        let qParams: any = { params: {} };
        if (f && f.split('?')[1]) {
          f.split('?')[1].split('&').map(p => qParams.params[p.split('=')[0]] = decodeURIComponent(p.split('=')[1]));
        }
        if (Object.keys(qParams.params).length === 0 && qParams.params.constructor === Object) {
          this.route.queryParamMap.subscribe(p => {
            qParams = { ...p };
          });
        }
        this.ulang = (qParams.params.ulang && this.helper.checkValidLangIso(qParams.params.ulang.toLowerCase()))
          ? qParams.params.ulang.toLowerCase() : null;
        if (!this.ulang) {
          this.ulang = this.locationService.locale;
        }
        this.clang = (qParams.params.clang && this.helper.checkValidLangIso(qParams.params.clang.toLowerCase()))
          ? qParams.params.clang.toLowerCase() : null;

        this.wish = qParams.params.wish;
        const wishDateString = dayjs(wishDate).format('YYYY-MM-DD');
        if (this.wish && this.wish !== wishDateString) {
          this.store.dispatch(new UpdateOrderWish(new Date(this.wish), {
            src: 'StoreLoadingComponent',
            description: 'Change in wish date'
          }));
        }
      });
    this.catalogLoaded = false;
    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.store.select(getSelectedStore)
      .pipe(
        takeUntil(this.unsubscribe$),
        withLatestFrom(this.store.pipe(select(getAvailableCatalogLanguages))),
      )
      .subscribe(([selectedStore, availableLanguageList]) => {
        this.selectedStore = selectedStore;
        this.userInterfaceLanguageOption = this.selectedStore?.settings.CUSTOMER_UI_LANGUAGE_OPTION;
        this.catalogLanguage = this.selectedStore?.language.locale;
        if (this.selectedStore && this.selectedStore.id) {
          // set document title
          this.document.title = this.selectedStore.name;
          // Added Google Analytics
          const gaCode = this.selectedStore.settings.GOOGLE_ANALYTICS_TRACKING_CODE;
          const gaCode4 = this.selectedStore.settings.GOOGLE_ANALYTICS_4_TRACKING_CODE;
          if (gaCode) {
            const gtagScript = document.createElement('script');
            gtagScript.type = 'text/javascript';
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaCode;
            document.head.appendChild(gtagScript);

            const gtagConfigScript = document.createElement('script');
            gtagConfigScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config','` + gaCode + `');`;
            document.head.appendChild(gtagConfigScript);
          }
          if (gaCode4) {
            const gtagScript = document.createElement('script');
            gtagScript.type = 'text/javascript';
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaCode4;
            document.head.appendChild(gtagScript);

            const gtagConfigScript = document.createElement('script');
            gtagConfigScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config','` + gaCode4 + `');`;
            document.head.appendChild(gtagConfigScript);
          }
          if (availableLanguageList?.loadedStoreId !== this.selectedStore.id) {
            this.store.dispatch(new LoadCatalogLanguages(this.selectedStore.id));
          }
        }
      });
    // select store catalog languages
    combineLatest([
      this.store.select(getAvailableCatalogLanguages),
      this.store.select(getSelectedStoreStatus)
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        withLatestFrom(this.store.pipe(select(getSelectedLang)), this.store.pipe(select(getCurrentCartUuid)))
      )
      .subscribe(([[state, selectedStoreStatus], selectedLang, currentCartUuid]) => {
        if (selectedStoreStatus !== 'LOADED') {
          return;
        }
        if (state && state.status === 'FETCHED') {
          this.availableCatalogLanguages = state.data;
          // const selectedCatalogLang = this.getCatalogLang(this.translate.getLangs().reverse());
          const selectedCatalogLang = this.getCatalogLang(this.getCatalogPreferedLangs().reverse());
          if (selectedCatalogLang !== '') {
            if (selectedCatalogLang !== selectedLang) {
              this.store.dispatch(new SelectCatalogLanguage(selectedCatalogLang, {
                src: 'StoreLoadingComponent',
                description: 'Change in available catalog languages'
              }));
            }
            /**
             * if set orderUuid in cookie => check for existing order
             * if not initialize new order object
             */
            let orderUuid = null;
            if (this.locationService.getOrderUuid()) {
              orderUuid = this.locationService.getOrderUuid();
            } else {
              orderUuid = this.cookieService.get('orderUuid-' + (this.isAdminOrderUpdate ? 'admin-' : '') + this.selectedStore.aliasName);
            }

            const urlParams = new URLSearchParams(this.window.location.href.split('?')[1]);
            const isQueryParamUuidLoad = urlParams.get('uuid') !== null;

            if (isQueryParamUuidLoad) {
              orderUuid = urlParams.get('uuid');
            }

            if (orderUuid) {
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id
                , orderUuid
                , 'CHECKEXISTING'
                , selectedCatalogLang
                , this.getInitOrder()
                , {
                  src: 'StoreLoadingComponent',
                  description: 'Change in available catalog languages'
                }
              ));
            } else {
              this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
            }
            this.store.dispatch(new GetStoreRules(this.selectedStore.id, selectedCatalogLang, {
              src: 'StoreLoadingComponent',
              description: 'Change in available catalog languages'
            }));
          } else {
            this.store.dispatch(new ErrorMessage('public.global.errorExpected', '101'));
          }
        }
      });
    this.storesService.getUserInterfaceLanguages().pipe(
    ).subscribe(data => {
      this.userInterfaceLanguages = data.sort((a, b) => a.name.localeCompare(b.name));
     });
    this.store.select(getSelectedLang)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(selectedLang => {
        if (this.selectedLang != selectedLang) {
          this.selectedLang = selectedLang;
          this.store.dispatch(new GetStoreRules(this.selectedStore.id, selectedLang, {
            src: 'StoreLoadingComponent',
            description: 'Change in selected language'
          }));
        }
      });

    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartStatus),
      this.store.select(getCookieState),
    ])
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(([selectedStore, currentCartStatus, cookieState]) => {
        if (selectedStore && currentCartStatus === 'LOADED' && cookieState) {
          const fbCode = selectedStore.settings.FACEBOOK_PIXEL_TRACKING_ID;
          const fbMetaContent = selectedStore.settings.FACEBOOK_DOMAIN_VERIFICATION_CODE;
          switch (cookieState.cookieState.status) {
            case 'UNSET':
              if (fbCode) {
                this.showCookieMessage = true;
              } else {
                this.onAcceptCookie();
              }
              break;
            case 'ACCEPT':
              if (fbCode) {
                this.trackingService.initFacebook(fbCode);
              }
              if (fbMetaContent && !this.fbMetaContentLoaded) {
                // TODO: Facebook domain verification doesn't work this way. This tag must be in the original
                // HTML because Facebook crawlers don't execute Javascript. We must implement a server side
                // render of this tag to make it work.
                const fbMetaTag = document.createElement('meta');
                fbMetaTag.name = 'facebook-domain-verification';
                fbMetaTag.content = fbMetaContent;
                document.head.appendChild(fbMetaTag);
                this.fbMetaContentLoaded = true;
              }
              this.showCookieMessage = false;
              break;
            default:
              this.showCookieMessage = false;
          }
        }
    },
    err => console.log('Error:', err),
    );
    this.store
      .select(getStoreOpeningInfo)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(storeOpeningInfo => {
        this.storeOpeningInfo = storeOpeningInfo;
      });
    this.store
      .select(getLoadedCatalogLanguage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(lang => this.loadedCatalogLang = lang);
    // load the catalog for selected store and language
    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentCartStatus),
      this.store.select(getCatalogState),
      this.store.select(getCurrentOrderMetaState)
      ]).pipe(
        takeUntil(this.unsubscribe$),
        filter(([store, language, cartStatus]) => !!store && !!store.id && !!language && cartStatus === 'LOADED')
      )
      .subscribe(([store, language, cartStatus, catalog, currentOrder]) => {
        const deliveryMethod = this.checkoutService.getPickupMethodStr() ?? store.settings.DEFAULT_DELIVERY_MODE;
        if ((store.settings.DELIVERY_REQUEST_ORDER_DATE_UPFRONT || store.settings.WISH_DATE_PER_ORDER_ITEM === 'ENABLED')
          && deliveryMethod) {
          if (!this.storeOpeningInfo || this.storeOpeningInfo.deliveryMethod !== deliveryMethod) {
            this.dispatchFetchSlots(store.id, deliveryMethod, this.wish || null, 'Change in store, language, cartStatus, catalog, currentOrder');
            return;
          }
        }
        const params = this.activatedRoute.snapshot.queryParams;
        const uiLang = params.ulang;
        if (!uiLang) {
          if (this.userInterfaceLanguageOption === 'SELECTED-CATALOG') {
            this.loadLanguage(language)
              .catch(_ => {
                this.loadLanguage('en');
                this.langLoaded = true;
              });
          } else {
            for (let [index, browserLang] of preferredBrowserLanguages.entries()) {
              if (browserLang.includes('-')) {
                browserLang = browserLang.split('-')[0];
              }
              const hasLocale = this.userInterfaceLanguages?.some(lang => lang.locale === browserLang);
              if (hasLocale) {
                this.loadLanguage(browserLang)
                  .catch(_ => {
                    this.loadLanguage(browserLang);
                    this.langLoaded = true;
                  });
                break;
              } else if (index === preferredBrowserLanguages.length - 1) {
                this.loadLanguage('en')
                  .catch(_ => {
                    this.loadLanguage('en');
                    this.langLoaded = true;
                  });
              }
            }
          }
        }
        else{
          this.loadLanguage(uiLang)
            .catch(_ => {
              this.loadLanguage('en');
              this.langLoaded = true;
            });
        }
        if (catalog?.cataloglist?.status !== 'LOADING' && this.loadedCatalogLang !== language) {
          this.store.dispatch(new LoadCatalog(store.id, language, currentOrder?.data?.wishTime ?? dayjs().toISOString(), {
            src: 'StoreLoadingComponent',
            description: 'Change in store, language, cartStatus, catalog, currentOrder'
          }));
        }
      });

    this.store.select(getSelectedCategory)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.selectedCategory = state;
      });

    this.storeViewState$ = this.store.pipe(
      delay(0),
      select(getCurrentStoreViewStatus),
      tap(_ => this.cd.detectChanges())
    );

    // subscribe to cart state
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getCartState),
      withLatestFrom(this.store.select(getSelectedStore))
    ).subscribe(([state, store]) => {
        this.loadProperView();
        const cartState = state.cartState;
        if (cartState.status === 'CHECKEXISTINGFAILED') {
          this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
        }
        if (cartState.status === 'LOADED') {
          if (cartState.data.uuid != null) {
            if (!this.cookieEnabled) {
              this.locationService.setOrderUuid(cartState.data.uuid);
            } else {
              this.locationService.setOrderUuid('');
              this.cookieService.set(
                'orderUuid-' + (this.isAdminOrderUpdate ? 'admin-' : '') + store.aliasName,
                cartState.data.uuid,
                1,
                '/'
              );
            }
          }

          // redirect to thank you page when order is not draft, but not initialzing new order....
          if (!this.router.url.includes('/orders/') && cartState.data.status !== 'DRAFT') {
            this.router.navigateByUrl(`${this.locationService.public_url()}#thankyou/e/${cartState.data.uuid}`);
          }
        }
      });

    this.store.select(getCustomerFooterHeight)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((customerFooterHeight) => {
        this.customerFooterHeight = customerFooterHeight;
        if (this.helper.isGoApp()) {
          this.renderer.setStyle(this.elementRef.nativeElement, 'height', `calc(var(--vh, 1vh) * 100 - ${this.customerFooterHeight}px)`);
        }
      });


    this.isPos = this.router.url.includes('/capture/');
  }

  private dispatchFetchSlots(storeId: number, deliveryMethod: string, wish: string | null, description: string) {
    this.store.dispatch(new FetchSlots(storeId, deliveryMethod, wish, {
      src: 'StoreLoadingComponent',
      description
    }));
  }

  onAcceptCookie() {
    this.cookieService.set('cookieEnabled', 'ACCEPT');
    this.store.dispatch(new AcceptCookie());
  }

  onRejectCookie() {
    this.cookieService.set('cookieEnabled', 'REJECT');
    this.store.dispatch(new RejectCookie());
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }

  loadProperView() {
    this.locationService.loadView(this.loadView);
  }

  // If the ui language of the browser exists in the catalog language list of the store
  // (which means there are some translations for this language)
  // then the system pre-selects the catalog language to be same as the ui language.
  // If not, the catalog language is the language of the store
  getCatalogPreferedLangs() {
    let ret = [];
    if (this.window.navigator.languages) {
      ret = this.window.navigator.languages.map((lang) => lang.substring(0, 2));
    } else {
      ret = [this.translate.getBrowserLang()];
    }
    if (this.ulang) {
      ret.unshift(this.ulang);
    }
    if (this.clang) {
      ret.unshift(this.clang);
    }
    return ret;
  }

  getCatalogLang(preferedLanguages) {
    let catalogLang = this.clang ?? this.selectedStore.language.locale;
    if (!this.availableCatalogLanguages || this.availableCatalogLanguages.length === 0) {
      return '';
    }
    else if (this.userInterfaceLanguageOption === 'BROWSER-PREFERRED') {
      preferedLanguages.forEach(lang => {
        this.availableCatalogLanguages.forEach(availableLang => {
          if (availableLang.locale === lang) {
            catalogLang = lang;
          }
        });
      });
      return catalogLang;
    }
    else{
      return catalogLang;
    }
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
    if (this.route.snapshot.paramMap.get('locationid')) {
      order.locationId = parseInt(this.route.snapshot.paramMap.get('locationid'), 10);
    }
    return order;
  }

  calcViewPortHeight() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  openReadMoreModal(event, from) {
    event.preventDefault();
    this.currentPopUpFrom = from;
    this.renderer.removeClass(this.readMoreModal.nativeElement, 'hide');
  }

  OnCheckOutsideClose() {
    this.currentPopUpFrom =  '';
    this.renderer.addClass(this.readMoreModal.nativeElement, 'hide');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    (this.document.getElementsByTagName('body')[0] as HTMLBodyElement).removeAttribute('style');
  }

}
