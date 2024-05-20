import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Inject,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  AfterViewChecked,
  Renderer2,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Observable, Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/local-storage.service';
import { Category, ClientStore, LocationValid, OrderItem } from 'src/app/stores/stores';
import {
  AddOrderItem,
  AddOrderMeta,
  CheckExistingOrder, ClearOrderMeta,
  FetchSlots,
  HideCookieMessage,
  ProceedToCheckout,
  RemoveOrderItem,
  SetCurrentSelectedCategory,
  SetCurrentSelectedTopCategory,
  SlotSelected, UpdateDeliveryMethod,
  UpdateLocation,
  UpdateOrderItem, UpdateVoucher,
} from '../../+state/stores.actions';
import { CatalogList, MobileStoreState, SelectedStoreState } from '../../+state/stores.reducer';
import {
  getCookieState,
  getCurrentCartContent,
  getCurrentCartState,
  getCurrentCartStatus,
  getCurrentCartUuid,
  getCustomerFooterHeight,
  getSelectedCategory,
  getSelectedLang,
  getSelectedStore,
  getSelectedStoreCatalog,
  getSelectedStoreStatus,
  getSelectedTopLevelCategory,
  getStoreLocations,
  getStoreOpenInDate,
  getStoreOpeningInfo,
  getUserLanguage,
} from '../../+state/stores.selectors';
import { Slot } from '../../types/AvailableSlotsResponse';
import { DELIVERY_METHOD_VALUES } from '../../types/DeliveryMethod';
import StoreUtils from '../../utils/StoreUtils';
import { browserRefresh } from 'src/app/app.component';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LocationService } from 'src/app/public/location.service';
import { CheckoutService } from '../../store-checkout/checkout.service';
import { WINDOW } from 'src/app/public/window-providers';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/public/helper.service';

@Component({
  selector: 'app-store-page',
  templateUrl: './store-page.component.html',
  styleUrls: ['./store-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePageComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @Input() acceptTermVisible = false;

  @ViewChild('contentHeader') contentHeader: ElementRef;
  @ViewChild('cartContent') cartContent: ElementRef;
  @ViewChild('catalogContent') catalogContent: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  availableSlots: Slot[];
  deliveryTime: Slot;
  userLang$: Observable<string>;
  browserTimeZone: string;
  categorySearch = '';
  searchSelectedCatList: number[] = [];
  menuCategories: Category[];
  topLevelCategories: Category[];
  selectedCat: number;
  selectedTopCat = -1;
  hasOtherTopLevelCategories: boolean;
  catalog: CatalogList;
  selectedCatalog: number;
  currentCartStatus: string;
  currentCartUuid: string;
  cartItems: OrderItem[] = [];
  showCookieMessage = false;
  locationData: LocationValid;
  showPayOnlineButton = false;
  standaloneUrl: string;
  selectedLang: string;
  fbCode: string;
  isAdminOrderCaptureUpdate: boolean;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  isOneClickToAddBasket = false;
  basketEnabled = false;
  selectedStoreStatus$: Observable<string>;
  deviceIdentifierAdded = false;
  topCatalogView = false;
  openInDate = true;

  navMaxLeftScroll = {};
  navMaxRightScroll = {};

  contentHeaderHeight = 120;
  cartContentPosition = 400;
  adminHeaderHeight = 0;
  skipScrollSpy = false;
  skipScrollTo = false;
  scrollOnLoad = true;

  isGoApp = false;
  customerFooterHeight: number;
  topCategoryContainerMarginBottom: number;

  constructor(
    private store: Store<SelectedStoreState>,
    public storageService: LocalStorageService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    private locationService: LocationService,
    public checkoutService: CheckoutService,
    @Inject(WINDOW) public window: Window,
    public router: Router,
    private helper: HelperService,
    private _ref: ChangeDetectorRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    this.selectedStore$ = this.store.pipe(select(getSelectedStore));
    this.userLang$ = this.store.select(getUserLanguage);
    this.selectedStoreStatus$ = this.store.pipe(select(getSelectedStoreStatus));
    this.browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.isGoApp = this.helper.isGoApp();

    if (this.storageService.getSavedState('categorySearch') && !browserRefresh) {
      this.categorySearch = this.storageService.getSavedState('categorySearch');
    }

    this.selectedStore$.pipe(takeUntil(this.unsubscribe$)).subscribe((selectedStore) => {
      this.selectedStore = selectedStore;
    });

    this.store
      .select(getSelectedLang)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.selectedLang = value;
        this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();
        if (this.selectedStore?.address && this.selectedStore?.currency) {
          this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale + '-' + this.selectedStore.address.country.code;
          this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
        }
        if (this.selectedStore?.settings) {
          this.fbCode = this.selectedStore.settings.FACEBOOK_PIXEL_TRACKING_ID;
          this.isOneClickToAddBasket = this.selectedStore.settings.ADD_BASKET_ONE_CLICK;
          this.basketEnabled = this.selectedStore.settings.BASKET_ENABLED;
        }
      });

    this.store.pipe(select(getStoreOpeningInfo), takeUntil(this.unsubscribe$)).subscribe((storeOpeningInfo) => {
      const slots = storeOpeningInfo.slots;
      if (slots.selectedSlot?.startTime) {
        this.deliveryTime = slots.selectedSlot;
        this.availableSlots = slots.availableSlots;
        // Needs to be done in the following order, first 'deliveryMethod' then 'wishTime'
        const defaultDeliveryMode = this.selectedStore?.settings?.DEFAULT_DELIVERY_MODE;
        if (defaultDeliveryMode) {
          const deliveryMethod = DELIVERY_METHOD_VALUES[defaultDeliveryMode];
          if (deliveryMethod && this.selectedStore?.settings['DELIVERY_' + defaultDeliveryMode]) {
            this.store.dispatch(new AddOrderMeta('deliveryMethod', deliveryMethod, {
              src: 'StorePageComponent',
              description: 'Store opening info changed'
            }));
          } else {
            this.store.dispatch(new AddOrderMeta('deliveryMethod', null, {
              src: 'StorePageComponent',
              description: 'Store opening info changed'
            }));
          }
        }
        this.store.dispatch(
          new AddOrderMeta('wishTime', dayjs(this.deliveryTime.startTime).toISOString(), {
            src: 'StorePageComponent',
            description: 'Store opening info changed',
          })
        );
      } else {
        this.deliveryTime = {
          startTime: storeOpeningInfo.date,
          endTime: null,
          totalOrders: 0,
          isDisabled: false,
        };
        this.availableSlots = [];
      }
      this._ref.detectChanges();
    });

    this.store
      .pipe(
        takeUntil(this.unsubscribe$),
        select(getStoreOpenInDate),
        filter((openInDate) => openInDate != null)
      )
      .subscribe((openInDate) => {
        this.openInDate = openInDate;
      });

    combineLatest([
      this.store.select(getSelectedStoreCatalog),
      this.store.select(getSelectedCategory),
      this.store.select(getSelectedTopLevelCategory),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ([catalog, category, selectedTopCat]) => {
          this.catalog = catalog;
          this.selectedCatalog = catalog.data.catalogId;
          this.topLevelCategories = catalog.data.topLevelCategories;
          if (this.topLevelCategories?.length) {
            if (selectedTopCat < 0) {
              const currentCategory = catalog.data.categories?.find((c) => c.categoryId == category);
              this.selectedTopCat = currentCategory ? currentCategory.topLevelCategoryId : this.topLevelCategories[0].categoryId;

              this.store.dispatch(new SetCurrentSelectedTopCategory(this.selectedTopCat));
            } else {
              this.selectedTopCat = selectedTopCat;
            }

            this.menuCategories = catalog.data.categories?.filter((c) => c.topLevelCategoryId == this.selectedTopCat);

            if (!this.menuCategories?.some((c) => c.categoryId == this.selectedCat)) {
              this.selectedCat = this.menuCategories?.[0]?.categoryId ?? -1;
              this.store.dispatch(new SetCurrentSelectedCategory(this.selectedCat));
            }

            this.hasOtherTopLevelCategories = catalog.data.categories?.some((c) => !c.topLevelCategoryId);
          } else {
            this.menuCategories = catalog.data.categories;
          }

          if (!this.selectedCat || this.selectedCat < 0) {
            this.selectedCat = this.menuCategories?.[0]?.categoryId ?? -1;
          }

          if (category != null && this.selectedCat !== category) {
            this.selectedCat = category;
          }
          if (this.selectedCat > 0 && this.selectedCat !== category && this.selectedCat !== this.menuCategories[0]?.categoryId) {
            this.scrollToCategory(this.selectedCat);
          }

          this._ref.detectChanges();

          if (category > 0) {
            this.expandCategory(category, 'off');
            if (this.scrollOnLoad) {
              this.scrollOnLoad = false;
              setTimeout(() => this.scrollToCategory(this.selectedCat), 300);
            }
          }

          this.observeNavScroll('nav-tab-wrapper');
          this.observeNavScroll('top-level-nav-tab-wrapper');
        },
        (err) => console.log('Error:', err)
      );

    combineLatest([
      this.store.select(getCurrentCartStatus),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentCartContent),
      this.store.select(getCookieState),
      this.store.select(getStoreLocations),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ([cartStatus, cartUuid, cartContent, cookieState, storeLocations]) => {
          this.currentCartStatus = cartStatus;
          switch (cartStatus) {
            case 'LOADED':
              this.currentCartUuid = cartUuid;
              this.cartItems = cartContent;

              // Show cookie message if cart is empty and cookie is initial or unset
              const isCartEmpty = !this.cartItems || this.cartItems.length === 0;
              const isCookieInitialOrUnset = cookieState?.cookieState.status === 'INITIAL' || cookieState?.cookieState.status === 'UNSET';
              this.showCookieMessage = cartStatus && cookieState && isCartEmpty && isCookieInitialOrUnset;

              const hashParam = window.location.hash.split('/');
              const subdomain = this.getSubdomain();
              if (hashParam[0] === '#l' && hashParam[1] && storeLocations) {
                this.locationData = storeLocations.storeLocationsState.locationState;
                const locationOrderStr = `${this.currentCartUuid}_${hashParam[1]}_${this.locationData?.id}`;
                this.cookieService.set(`location-order-${this.selectedStore.aliasName}`, locationOrderStr);
                if (this.selectedStore.settings.ENABLE_STANDALONE_PAYMENT === 'ENABLE_OPEN_TAP' && (this.selectedStore.settings.OPEN_TAP || this.locationData?.openTab)) {
                  this.showPayOnlineButton = true;
                  this.standaloneUrl = `/standalone-payment/l/${this.locationData?.id}`;
                }
              }
              if (
                !hashParam[0] &&
                hashParam[0] !== '#l' &&
                this.cookieService.get(`location-order-${this.selectedStore.aliasName}`) &&
                this.currentCartUuid === this.cookieService.get(`location-order-${this.selectedStore.aliasName}`).split('_')[0] &&
                this.cookieService.get(`location-order-${this.selectedStore.aliasName}`).split('_')[2]
              ) {
                if (this.selectedStore.settings.ENABLE_STANDALONE_PAYMENT === 'ENABLE_OPEN_TAP') {
                  this.showPayOnlineButton = true;
                  const locationId = this.cookieService.get(`location-order-${this.selectedStore.aliasName}`).split('_')[2];
                  this.standaloneUrl = `/standalone-payment/l/${locationId}`;
                }
              }
              break;
            case 'ITEMADDED':
            case 'ITEMUPDATED':
            case 'ITEMREMOVED':
              this.store.dispatch(
                new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang, null, {
                  src: 'StorePageComponent',
                  description: 'Cart status changed',
                })
              );
              break;
          }
          this._ref.detectChanges();
        },
        (err) => console.log('Error:', err)
      );

    combineLatest([this.store.select(getStoreLocations), this.store.select(getCurrentCartState), this.store.select(getSelectedStore)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([location, order, store]) => {
        const hashParam = window.location.hash.split('/');
        if (store?.id) {
          if (hashParam[0] === '#l' && hashParam[1] && order?.uuid && location) {
            if (location?.storeLocationsState?.locationState?.id && order.location !== location.storeLocationsState.locationState.label) {
              this.store.dispatch(new UpdateLocation(location.storeLocationsState.locationState.id, this.helper.getDeviceID()));
            }
          } else if (order?.uuid && !this.deviceIdentifierAdded) {
            if (this.helper?.deviceIdentifierCheck?.flag === true && this.helper?.deviceIdentifierCheck?.orderId === order?.uuid) {
              this.deviceIdentifierAdded = true;
            } else {
              if (!this.isAdminOrderCaptureUpdate) {
                this.store.dispatch(new UpdateLocation(null, this.helper.getDeviceID()));
              }
              this.helper.deviceIdentifierCheck.flag = true;
              this.helper.deviceIdentifierCheck.orderId = order.uuid;
            }
          }
        }
      });

    
    this.store.select(getCustomerFooterHeight)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((customerFooterHeight) => {
        this.customerFooterHeight = customerFooterHeight;
        let buttonWrapperElement = document.getElementById('button-wrapper');
        this.renderer.setStyle(buttonWrapperElement, 'bottom', `${this.customerFooterHeight}px`);

      });

    this.clearSearchCategory();
  }

  ngAfterViewChecked(): void {
    let buttonWrapperElement = document.getElementById('button-wrapper');
    this.topCategoryContainerMarginBottom = this.customerFooterHeight + (buttonWrapperElement?.offsetHeight ?? 0);    
  }

  decreaseItemFromCart(item: OrderItem){
  if (item.quantity > 1) {
    let childItemRequests = [];
    if (item.childOrderItems) {
      childItemRequests = item.childOrderItems.map((oItem) => ({
        offerId: oItem.offerId,
        quantity: oItem.quantity,
      }));
    }
    item.quantity -= 1;
    if (item.variantOfferId) {
      childItemRequests.push({
        offerId: item.variantOfferId,
        quantity: item.quantity,
      });
    }
    this.store.dispatch(
      new UpdateOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid, {
        childItemRequests,
        comment: item.comment,
        offerId: item.offerId,
        quantity: item.quantity,
        wishTime: item.wishTime
      })
    );
  } else {
    item.quantity -= 1;
    this.store.dispatch(new RemoveOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid));
  }
}

  ngAfterViewInit() {
    this.observeContentHeaderResize();
    this.appendOnScroll('nav-tab-wrapper');
    this.appendOnScroll('top-level-nav-tab-wrapper');
  }

  appendOnScroll(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.onscroll = () => this.observeNavScroll(elementId);
    }
  }

  observeContentHeaderResize() {
    const contentHeaderEl = this.contentHeader?.nativeElement;
    if (contentHeaderEl) {
      new ResizeObserver(() => {
        if (this.contentHeaderHeight !== contentHeaderEl.offsetHeight) {
          this.contentHeaderHeight = contentHeaderEl.offsetHeight;
          this._ref.detectChanges();
        }
        if (this.isAdminOrderCaptureUpdate) {
          this.adminHeaderHeight = document.getElementById('app-header-admin')?.offsetHeight || 0;
        }

        this.observeNavScroll('nav-tab-wrapper');
        this.observeNavScroll('top-level-nav-tab-wrapper');
      }).observe(this.contentHeader.nativeElement);
    }
  }

  observeNavScroll(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      this.navMaxLeftScroll[elementId] = element.scrollLeft === 0;
      this.navMaxRightScroll[elementId] = element.scrollLeft === element.scrollWidth - element.clientWidth;
    }
    this._ref.detectChanges();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll($event: any) {
    this.cartContentPosition = this.cartContent?.nativeElement?.getBoundingClientRect()?.top || 400;
    this.doScrollSpy();
  }

  doScrollSpy() {
    if (!this.skipScrollSpy) {
      const sections = document.querySelectorAll('.category-tab');
      const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
      let id = sections[0]?.id;
      for (const s in sections) {
        if ((sections[s] as HTMLElement).offsetTop <= scrollPos + this.contentHeaderHeight + this.adminHeaderHeight) {
          id = sections[s].id;
        }
      }
      if (id) {
        const categoryId = id.replace(/\D/g, '');
        this.scrollNavTo(Number(categoryId));
        this.selectCategory(Number(categoryId));
      }
    }
  }

  scrollToCategory(categoryId: number) {
    if (!this.skipScrollTo) {
      const offset = this.contentHeaderHeight + this.adminHeaderHeight;
      const bodyRect = document.body.getBoundingClientRect().top;
      const element = document.getElementById(`category${categoryId}`);
      const elementRect = element?.getBoundingClientRect()?.top || 0;
      const elementPosition = elementRect - bodyRect;
      const top = elementPosition - offset + 1;
      this.doSkipScrollSpy();

      const behavior = this.helper.isIOS() || !this.isAdminOrderCaptureUpdate ? 'smooth' : 'auto';

      window.scrollTo({ top, behavior });
    }
  }

  scroolToTop() {
    const element = document.getElementById('top-anchor');
    if (element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
      if (!vertInView) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }
  }

  doSkipScrollSpy(time = 2000) {
    this.skipScrollSpy = true;
    setTimeout(() => (this.skipScrollSpy = false), time);
  }

  doSkipScrollTo(time = 1500) {
    this.skipScrollTo = true;
    setTimeout(() => (this.skipScrollTo = false), time);
  }

  scrollNavToLeft(elementId: string) {
    const container = document.getElementById(elementId);
    const current = container.scrollLeft;
    const offset = container.clientWidth * 0.7;
    container.scrollTo({ left: current - offset, behavior: 'smooth' });
  }

  scrollNavToRight(elementId: string) {
    const container = document.getElementById(elementId);
    const current = container.scrollLeft;
    const offset = container.clientWidth * 0.7;
    container.scrollTo({ left: current + offset, behavior: 'smooth' });
  }

  scrollNavTo(categoryId: number) {
    if (this.selectedCat !== categoryId) {
      const behavior = this.helper.isIOS() ? 'smooth' : 'auto';
      document.getElementById(`tab${categoryId}`)?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
    }
  }

  shouldDisplaySiblingSelection() {
    return this.selectedStore?.relation?.siblingStores?.some((sibling) => !sibling.isIndependent);
  }

  shouldDisplayDateSelection(): boolean {
    return (this.selectedStore?.settings?.DELIVERY_REQUEST_ORDER_DATE_UPFRONT && this.selectedStore?.settings?.DEFAULT_DELIVERY_MODE) ||
      this.selectedStore?.settings?.WISH_DATE_PER_ORDER_ITEM === 'ENABLED';
  }

  shouldDisplaySlotSelection(): boolean {
    return !StoreUtils.isAsapOrderEnabled(this.selectedStore, this.selectedStore?.settings?.DEFAULT_DELIVERY_MODE);
  }

  onDateChanged(date: Slot) {
    this.deliveryTime = date;
    if (
      this.selectedStore.settings.DEFAULT_DELIVERY_MODE &&
      this.selectedStore.settings['DELIVERY_' + this.selectedStore.settings.DEFAULT_DELIVERY_MODE]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE], {
        src: 'StorePageComponent',
        description: 'Date changed'
      }));
    } else {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', null, {
        src: 'StorePageComponent',
        description: 'Date changed'
      }));
    }
    this.store.dispatch(
      new FetchSlots(
        this.selectedStore.id,
        this.selectedStore.settings.DEFAULT_DELIVERY_MODE || 'NO_LOCATION',
        this.deliveryTime.startTime,
        {
          src: 'StorePageComponent',
          description: 'Date changed',
        }
      )
    );
  }

  onSelectedSlotChanged(selectedSlot: Slot) {
    this.deliveryTime = selectedSlot;
    if (
      this.selectedStore.settings.DEFAULT_DELIVERY_MODE &&
      this.selectedStore.settings['DELIVERY_' + this.selectedStore.settings.DEFAULT_DELIVERY_MODE]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE], {
        src: 'StorePageComponent',
        description: 'Slot changed'
      }));
    } else {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', null, {
        src: 'StorePageComponent',
        description: 'Slot changed'
      }));
    }
    if (!this.deliveryTime.startTime) {
      return;
    }
    this.store.dispatch(
      new AddOrderMeta('wishTime', dayjs(this.deliveryTime.startTime).toISOString(), {
        src: 'StorePageComponent',
        description: 'Slot changed',
      })
    );
    this.store.dispatch(new SlotSelected(selectedSlot));
  }

  isTimeShowDisabled() {
    return this.checkoutService.isTimeShowDisabled();
  }

  onKeypressSearchCategory(event: any) {
    this.categorySearch = event.target.value.trim();
    this.storageService.setSavedState(this.categorySearch, 'categorySearch');
    if (this.categorySearch.length === 0) {
      this.searchSelectedCatList = [];
    }
  }

  clearSearchCategory() {
    this.categorySearch = '';
    this.searchSelectedCatList = [];
    this.storageService.removeSavedState('categorySearch');
  }

  onSelectCategory(categoryId: number, toggle = 'off') {
    this.hideCookieMessage();
    this.expandCategory(categoryId, toggle);
    if (toggle === 'toggle') {
      this.doSkipScrollTo();
    }
    this.scrollToCategory(categoryId);
    this.selectCategory(categoryId);
  }

  onSelectTopLevelCategory(categoryId: number, toggle = 'off') {
    this.topCatalogView = false;
    this.hideCookieMessage();
    this.selectTopLevelCategory(categoryId);
  }

  onSelectTopCatalogView() {
    this.topCatalogView = true;
  }

  expandCategory(categoryId: number, toggle: string) {
    const queryCatNav = this.catalogContent?.nativeElement?.querySelector(`#category${categoryId}`);
    if (toggle === 'off') {
      queryCatNav?.classList.add('expanded');
    }
    if (toggle === 'toggle') {
      queryCatNav?.classList.toggle('expanded');
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    const queryCatNav = this.catalogContent?.nativeElement?.querySelector(`#category${categoryId}`);
    return queryCatNav?.classList.contains('expanded') || false;
  }

  selectCategory(categoryId: number) {
    if (this.selectedCat !== categoryId) {
      this.selectedCat = categoryId;
      this.store.dispatch(new SetCurrentSelectedCategory(categoryId));
    }
  }

  selectTopLevelCategory(categoryId: number) {
    if (this.selectedTopCat !== categoryId) {
      this.scroolToTop();
      this.store.dispatch(new SetCurrentSelectedTopCategory(categoryId));
    }
  }

  checkCategorySearchFilter(items: any) {
    if (items) {
      const tempItems = items.filter((menuItem) => menuItem.name?.toLocaleLowerCase().includes(this.categorySearch?.toLocaleLowerCase()));
      tempItems.forEach((element) => this.searchSelectedCatList.push(element.categoryId));
      return tempItems.length > 0;
    }
  }

  getBackgroundImage(url: any) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
    }
    return '';
  }

  hideCookieMessage() {
    if (this.showCookieMessage && !this.fbCode) {
      this.store.dispatch(new HideCookieMessage());
    }
  }

  getSubdomain(): string {
    return environment.name === 'local' ? environment.envDomain + ':' + window.location.port : environment.envDomain;
  }

  viewProductDetails(offerId, categoryId, inStock, isExpandable, isOrderable, BASKET_ENABLED) {
    if (!inStock || (!isExpandable && (!isOrderable || (!BASKET_ENABLED && !this.isAdminOrderCaptureUpdate)))) {
      return;
    }

    this.store.dispatch(new SetCurrentSelectedCategory(categoryId));
    this.hideCookieMessage();
    this.router.navigateByUrl(this.locationService.base_url(`category/${categoryId}`)).then(() => {
      this.router.navigateByUrl(this.locationService.base_url(`offer/${offerId}`));
    });
  }

  checkOfferInCart(menuItem) {
    if (!this.cartItems) {
      return {};
    }
    return {
      item: this.cartItems.find((item) => item.offerId === menuItem.offerId),
    };
  }

  isAllergenSeleted(attributes, name) {
    const attr = attributes.find((item) => item.key === name);
    return attr ? attr.value : false;
  }

  onOneClickAddToCart(event, offerId, categoryId, inStock, isDirectlyOrderable, isExpandable, isOrderable, BASKET_ENABLED) {
    event.stopPropagation();
    this.doSkipScrollTo();
    if (
      !this.selectedStore.settings.ADD_BASKET_ONE_CLICK ||
      !isDirectlyOrderable ||
      !isOrderable ||
      !BASKET_ENABLED ||
      !inStock ||
      this.checkoutService.isClosedForOrdering()
    ) {
      this.viewProductDetails(offerId, categoryId, inStock, isExpandable, isOrderable, BASKET_ENABLED);
      return;
    }
    const wishTime = this.selectedStore.settings.WISH_DATE_PER_ORDER_ITEM === 'ENABLED' ? this.deliveryTime.startTime : null;
    this.store.dispatch(
      new AddOrderItem(this.selectedStore.id, this.currentCartUuid, {
        offerId,
        quantity: 1,
        comment: '',
        childItemRequests: [],
        wishTime
      })
    );
  }

  cartItemsTotalValue() {
    return (
      this.cartItems?.reduce((total, item) => total + (item.discountType ? item.totalDiscountedPrice : item.totalNonDiscountedPrice), 0) ||
      0
    );
  }

  payOnline() {
    if (this.standaloneUrl) {
      this.router.navigateByUrl(this.standaloneUrl);
    }
  }

  onViewOrder(event) {
    event.preventDefault();
    this.store.dispatch(new SetCurrentSelectedCategory(this.selectedCat));
    this.store.dispatch(new ProceedToCheckout());
    this.router.navigateByUrl(this.locationService.base_url(`cart`));
  }

  // TODO work on this
  viewOrderItemDetails(item: OrderItem) {
    // check if the orderUuid is in fact a store promo rule
    // if yes, then do nothing
    if (item.hierarchyLevel !== 'PARENT') {
      return;
    }
    this.router.navigateByUrl(this.locationService.base_url(`orderItem/${item.uuid}`));
  }

  onDecreaseItemQty(event, item) {
    event.stopPropagation();
    this.doSkipScrollTo();
    if (this.currentCartStatus !== 'LOADED') {
      return;
    }
    this.decreaseItemFromCart(item);
  }
  onIncreaseItemQty(event, item) {
    event.stopPropagation();
    this.doSkipScrollTo();
    let childItemRequests = [];
    if (this.currentCartStatus !== 'LOADED') {
      return;
    }
    if (item.childOrderItems) {
      childItemRequests = item.childOrderItems.map((oItem) => ({
        offerId: oItem.offerId,
        quantity: oItem.quantity,
      }));
    }
    item.quantity += 1;
    if (item.variantOfferId) {
      childItemRequests.push({
        offerId: item.variantOfferId,
        quantity: item.quantity,
      });
    }
    this.store.dispatch(
      new UpdateOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid, {
        childItemRequests,
        comment: item.comment,
        offerId: item.offerId,
        quantity: item.quantity,
        wishTime: item.wishTime
      })
    );
  }

  showStoreClosedMessage(): boolean {
    return this.checkoutService.isClosedForOrdering() || !this.openInDate;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getTotalQuantity() {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
}
