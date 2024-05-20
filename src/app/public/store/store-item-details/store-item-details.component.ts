import {
  getCurrentOfferItemStatus,
  getSelectedCategoryState,
  getStoreOpeningInfo,
  getUserLanguage
} from './../+state/stores.selectors';
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit, OnDestroy, HostListener, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ClientStore, Offer, OrderItem, StoreViewState, OfferVariant, LocationValid, Category } from 'src/app/stores/stores';
import { Observable, Subject, combineLatest, timer } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { SelectedStoreState } from '../+state/stores.reducer';
import {
  getSelectedStore
  , getCurrentOfferItem
  , getCurrentCartUuid
  , getCurrentCartContent
  , getCurrentStoreViewStatus
  , getCurrentCartStatus
  , getSelectedLang
  , getStoreLocationsState
  , getOfferItem
} from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import {
  AddOrderItem,
  RemoveOrderItem,
  CheckExistingOrder,
  ErrorMessage,
  UpdateOrderItem,
  CartStatusUpdate,
  AddOrderMeta, FetchSlots, SlotSelected
} from '../+state/stores.actions';
import { HelperService } from '../../helper.service';
import { Router } from '@angular/router';
import { LocationService } from '../../location.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WINDOW } from '../../window-providers';
import { TranslateService } from '@ngx-translate/core';
import { CheckoutService } from '../store-checkout/checkout.service';
import { InactivityModalComponent } from '../inactivity-modal/inactivity-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import dayjs from 'dayjs';
import { Slot } from '../types/AvailableSlotsResponse';
import StoreUtils from '../utils/StoreUtils';

@Component({
  selector: 'app-store-item-details',
  templateUrl: './store-item-details.component.html',
  styleUrls: ['./store-item-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreItemDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  offerItem$: Observable<Offer>;
  offerItemLoadingStatus$: Observable<string>;
  selectedItem: Offer;
  categories: any[];
  selectedOrderUuid: string = null;
  cart$: Observable<OrderItem[]>;
  cartItems: OrderItem[];
  currentViewState$: Observable<StoreViewState>;
  currentViewState: StoreViewState;
  selectedLang: string;
  currentCartUuid: string;
  qty: number;
  maxItemQty: number;
  addToCartDisabled: boolean;
  addedToCart: boolean;
  childOffers: any[];
  childCheckboxAsRadioOfferItemsList: any[];
  childSelectedCheckboxOfferItems: any[];
  childTouchedCheckboxOfferItems: any[];
  childSelectedRadioOfferItems: any[];
  specialNoteFg: FormGroup;
  radioCategoriesFg: FormGroup;
  radioVariantsFg: FormGroup;
  offerVariants: OfferVariant[];
  showPriceDisabled: boolean;
  validatedLocation: LocationValid;
  orderItemInView: OrderItem = null;  // if set it means that we are reviewing an Order Item not Offer
  showStickyScroll: boolean;
  basketEnabled = true;
  isOrderable = false;
  isPos = false;
  innerHeight = 500;
  isStoreClosed = false;
  isAdminOrderCaptureUpdate: boolean;
  modalShown = true;
  backToCurrentCat = '';
  availableSlots: Slot[];
  userActivity;
  userLang$: Observable<string>;
  browserTimeZone: string;
  isOrderItemAdding: boolean = false;

  @ViewChild('itemWrapper') itemWrapper: ElementRef;
  @ViewChild('scrollableContainer') scrollableContainer: ElementRef;
  deliveryTime: Slot;
  @HostListener('window:resize', ['$event'])
  @HostListener('window:scroll', ['$event'])
  onResize(event) {
    this.scrollCalc();
  }

  constructor(private store: Store<SelectedStoreState>
    , public helper: HelperService
    , private router: Router
    , private locationService: LocationService
    , private cookieService: CookieService
    , private sanitizer: DomSanitizer
    , private fb: FormBuilder
    , private translateSer: TranslateService
    , public checkoutService: CheckoutService
    , @Inject(WINDOW) private window: Window
    , private dialog: MatDialog
  ) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {
    this.qty = 1;
    this.maxItemQty = 999;
    this.addToCartDisabled = false;
    this.showPriceDisabled = false;
    this.childCheckboxAsRadioOfferItemsList = [];
    this.childSelectedCheckboxOfferItems = [];
    this.childTouchedCheckboxOfferItems = [];
    this.childSelectedRadioOfferItems = [];
    this.offerVariants = [];
    this.userLang$ = this.store.select(getUserLanguage);
    this.browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (this.cookieService.check('basketEnabled')) {
      this.basketEnabled = this.cookieService.get('basketEnabled') === 'true';
    } else {
      this.basketEnabled = this.locationService.isBasketEnabled() === null ? true : this.locationService.isBasketEnabled();
    }

    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.selectedStore$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedStore = value;
        this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();
        if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
          this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
            + '-'
            + this.selectedStore.address.country.code;
          this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
        }

        if (this.selectedStore.settings) {
          this.basketEnabled = this.basketEnabled &&
            (this.selectedStore.settings.ENABLE_ORDERING || this.selectedStore.settings.BASKET_ENABLED);
        }
      });
    this.offerItem$ = this.store.pipe(
      select(getCurrentOfferItem)
    );
    this.offerItemLoadingStatus$ = this.store.pipe(
      select(getCurrentOfferItemStatus)
    );
    this.store.select(getCurrentCartUuid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.currentCartUuid = state;
      });
    this.cart$ = this.store.pipe(
      select(getCurrentCartContent)
    );
    this.cart$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.cartItems = value;
      });
    this.store.select(getStoreLocationsState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          this.validatedLocation = state;
        }
      });
    combineLatest([this.store.select(getCurrentStoreViewStatus), this.store.select(getOfferItem)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (result[0]) {
          this.currentViewState = result[0];
        }
        if (result[1]) {
          this.selectedOrderUuid = result[1].offerItemState.selectedOrderItemUuid;
          this.selectedItem = result[1].offerItemState.data;
          this.categories = result[1].offerItemState.data?.categories?.slice();
          if (this.isProductDetailsView()) {
            this.radioButtonVariantValidationRules();
            this.radioButtonValidationRules(false);
          }
          if (this.isProductDetailsCartView()) {
            this.addedToCart = this.IsAddedToCart();
            this.radioButtonVariantValidationRules();
            this.radioButtonValidationRules(true);
          }
          // set form validation rules
          let defaultValue = '';
          if (this.orderItemInView && this.orderItemInView.comment) {
            defaultValue = this.orderItemInView.comment;
          }
          this.specialNoteFg = this.fb.group({
            specialNote: [defaultValue, [Validators.compose([Validators.maxLength(256)])]],
          });

          if (this.selectedItem && result[1].offerItemState.status === 'LOADED') {
            this.isOrderable = this.selectedItem.isOrderable;
          }
        }
        if (result[0] && result[1]) {
          const calc = timer(120);
          calc.subscribe(_ => { this.scrollCalc(); });
        }
      });

    // this.store.select(getCurrentCartStatus)
    combineLatest([this.store.select(getCurrentCartStatus), this.store.select(getSelectedLang)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(results => {
        if (results && results[0] && results[1]) {
          const state = results[0];
          this.selectedLang = results[1];
          const evt = {
            src: 'StoreItemDetailsComponent',
            description: `Cart state updated: ${state}`,
          };
          switch (state) {
            case 'REFRESHED':
              // mark current cart state as loaded:
              this.store.dispatch(new CartStatusUpdate('LOADED'));
              this.locationService.goBack('');
              break;
            case 'ITEMADDED':
              // dispatch check existing order with intend to refresh
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'REFRESH', this.selectedLang, null, evt));
              break;
            case 'ITEMUPDATED':
              // dispatch check existing order with intend to refresh
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'REFRESH', this.selectedLang, null, evt));
              break;
            case 'ITEMADDFAILED':
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang, null, evt));
              // ATM on fail always go to catalog view
              // this.router.navigateByUrl('');
              this.store.dispatch(new ErrorMessage('We were unable to add the item to your order. Please try again later!'));
              break;
            case 'ITEMUPDATEFAILED':
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang, null, evt));
              // ATM on fail always go to catalog view
              // this.router.navigateByUrl('');
              this.store.dispatch(new ErrorMessage('We were unable to update the item from your order. Please try again later!'));
              break;
            case 'ITEMREMOVED':
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang, null, evt));
              // this.router.navigateByUrl('#cart');
              this.locationService.goBack('#cart');
              break;
            case 'ITEMREMOVEFAILED':
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang, null, evt));
              break;
          }
        }
      });

    this.specialNoteFg = this.fb.group({
      specialNote: ['', Validators.compose([Validators.maxLength(256)])],
    });

    this.isPos = this.router.url.includes('/capture/');
    this.store.select(getSelectedCategoryState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        if (value && value.currentCategoryState) {
          this.backToCurrentCat = value.currentCategoryState.selectedCategory;
        }
      });
    if (this.selectedStore.settings.INACTIVITY_OPTION && this.modalShown) {
      this.setTimeout();
    }

    this.store.pipe(select(getStoreOpeningInfo), takeUntil(this.unsubscribe$)).subscribe((storeOpeningInfo) => {
      const slots = storeOpeningInfo.slots;
      this.deliveryTime = slots.selectedSlot;
      this.availableSlots = slots.availableSlots;
    });
  }

  isProductDetailsView(): boolean {
    return this.currentViewState.state === 'VIEWPRODUCTDETAILS';
  }

  isProductDetailsCartView(): boolean {
    return this.currentViewState.state === 'VIEWPRODUCTDETAILSFROMCARTVIEW';
  }

  ngAfterViewInit() {
    this.helper.scrollTo(0, 0);
  }

  getControl(name: string, form: string = 'specialNoteFg') {
    return this[form].get(name);
  }

  radioButtonValidationRules(isFromCart: boolean) {
    const radioGroups = {};
    const childOrderItems = [];
    const previousCheckboxItems = this.childSelectedCheckboxOfferItems;
    const previousRadioItems = this.childSelectedRadioOfferItems;
    this.childSelectedCheckboxOfferItems = [];
    this.childSelectedRadioOfferItems = [];
    if (this.orderItemInView && this.orderItemInView.childOrderItems) {
      this.orderItemInView.childOrderItems.forEach(child => {
        childOrderItems.push(child.offerId);
      });
    }
    if (this.selectedItem && this.categories) {
      this.categories.forEach(childCategory => {

        if (childCategory.min === 0 && childCategory.max === 1) {
          this.childCheckboxAsRadioOfferItemsList[childCategory.categoryId] = [];
        }
        if (childCategory.min === 1 && childCategory.max === 1 && childCategory.offers) {
          let defaultValue = '';
          if (childCategory.offers) {
            childCategory.offers.forEach(offerItem => {
              if (
                (isFromCart && childOrderItems.includes(offerItem.offerId)) ||
                (!isFromCart && this.isPreSelected(offerItem)) ||
                previousRadioItems.some((item) => item.offerId === offerItem.offerId)
              ) {
                defaultValue = offerItem.offerId.toString();
                this.childSelectedRadioOfferItems[childCategory.categoryId] = offerItem;
              }
            });
          }
          radioGroups['cat' + childCategory.categoryId] = [defaultValue, [Validators.required]];

        } else {
          if (childCategory.offers) {
            const touched = childCategory.offers.some((offerItem) => this.childTouchedCheckboxOfferItems.some((item) => item.offerId === offerItem.offerId));
            childCategory.offers.forEach(offerItem => {
              const previous = previousCheckboxItems.find((item) => item.offerId === offerItem.offerId);
              const isItemFromCart = isFromCart && childOrderItems.includes(offerItem.offerId);
              const isItemPreSelected = !isFromCart && this.isPreSelected(offerItem) && !touched;

              if (childCategory.min === 0 && childCategory.max === 1) {
                this.childCheckboxAsRadioOfferItemsList[childCategory.categoryId].push(offerItem.offerId);
              }

              if (!childCategory.orderMultipleSameItem) {
                const isChecked = isItemFromCart || isItemPreSelected || previous;
                if (isChecked) {
                  this.childSelectedCheckboxOfferItems.push(offerItem);
                }
                radioGroups['var' + offerItem.offerId] = [(isChecked ? offerItem.offerId : ''), []];
              } else {
                let quantity = 0;
                if (isItemFromCart) {
                  quantity = this.orderItemInView.childOrderItems.find((orderItem) => orderItem.offerId === offerItem.offerId)?.quantity || 0;
                }

                if (isItemPreSelected) {
                  quantity = 1;
                }

                if (previous) {
                  quantity = previous.quantity;
                }

                if (quantity) {
                  this.childSelectedCheckboxOfferItems.push({ ...offerItem, quantity });
                }
                radioGroups['var' + offerItem.offerId] = quantity;
              }
            });
          }
        }
      });
    }
    this.radioCategoriesFg = this.fb.group(radioGroups);
  }

  private isPreSelected(offerItem: Offer) {
    return offerItem.attributeDtos?.some((at) => at.key === 'PRESELECTED' && at.value);
  }

  radioButtonVariantValidationRules() {
    this.offerVariants = [];
    if (this.selectedItem && this.selectedItem.variants) {
      // hide the price until a variant is selected
      this.showPriceDisabled = true;
      // 1st. add the base offer
      this.offerVariants.push({
        offerId: this.selectedItem.offerId,
        price: this.selectedItem.price,
        priceDescription: (this.selectedItem.priceDescription) ? this.selectedItem.priceDescription : this.translateSer.instant('public.global.standard'),
        discount: (this.selectedItem.discount) ? this.selectedItem.discount : 0,
        discountType: (this.selectedItem.discountType) ? this.selectedItem.discountType : '',
      });
      // add all offerVariants
      this.selectedItem.variants.forEach(variant => {
        this.offerVariants.push({
          offerId: variant.offerId,
          price: variant.price,
          priceDescription: (variant.priceDescription) ? variant.priceDescription : '',
          discount: (variant.discount) ? variant.discount : 0,
          discountType: (variant.discountType) ? variant.discountType : '',
        });
      });
      this.radioVariantsFg = this.fb.group({ offerVariants: ['', Validators.compose([Validators.required])] });
      if (this.orderItemInView) {
        let selectedVariant = this.orderItemInView.offerId.toString();
        if (this.orderItemInView.variantOfferId) {
          selectedVariant = this.orderItemInView.variantOfferId.toString();
          this.onSelectOfferVariant(this.orderItemInView.variantOfferId);
        }
        this.radioVariantsFg = this.fb.group({ offerVariants: [selectedVariant, Validators.compose([Validators.required])] });
      }
    } else {
      this.radioVariantsFg = null;
      this.showPriceDisabled = false;
    }
  }

  // only enable the add to cart
  onSelectOfferVariant(offerId: number) {
    const variant: OfferVariant[] = this.selectedItem.variants?.filter(v => v.offerId === offerId);
    if (variant && variant.length > 0 && variant[0].categories && variant[0].categories?.length > 0) {
      this.categories = variant[0].categories?.slice();
    } else {
      this.categories = this.selectedItem?.categories?.slice();
    }
    if (this.isProductDetailsView()) {
      this.radioButtonValidationRules(false);
    }
    if (this.isProductDetailsCartView()) {
      this.radioButtonValidationRules(true);
    }
    this.showPriceDisabled = false;
  }

  checkMultipleOptionsValid(childCategory: Category) {
    let checkedItemCount = 0;
    if (childCategory.orderMultipleSameItem) {
      const checkedItems = this.childSelectedCheckboxOfferItems
        .filter((item) => item.categoryId === childCategory.categoryId)
        .map((item) => item.quantity);
      if (checkedItems.length) {
        checkedItemCount = checkedItems.reduce((sum, qty) => sum + qty);
      }
    } else {
      checkedItemCount = this.childSelectedCheckboxOfferItems.filter((item) => item.categoryId === childCategory.categoryId).length;
    }
    if (
      (childCategory.min !== 1 || childCategory.max !== 1) &&
      (checkedItemCount < childCategory.min ||
        (childCategory.max > -1 && checkedItemCount > childCategory.max))
    ) {
      return true;
    }
    return false;
  }

  IsAddToCartDisabled() {
    if ((this.radioCategoriesFg && !this.radioCategoriesFg.valid) || (this.radioVariantsFg && !this.radioVariantsFg.valid)) {
      return true;
    }
    if (this.selectedItem && this.categories) {
      for (const childCategory of this.categories) {
        if (this.checkMultipleOptionsValid(childCategory)) {
          return true;
        }
      }
    }
    return false;
  }

  OnCloseItemDetails(event) {
    event.preventDefault();
    this.locationService.goBack('');
  }

  // child offers cannot have discount
  getCurrentItemPrice() {
    if (!this.selectedItem) { return 0; }
    let childOfferPrice = this.childSelectedCheckboxOfferItems
      .filter(({ price: prc }) => prc)
      .reduce((prc, orderItem) => prc + orderItem.price * (orderItem.quantity ? orderItem.quantity : 1), 0);
    childOfferPrice += this.childSelectedRadioOfferItems.filter(({ price: prc }) => prc).reduce((prc, orderItem) => prc + orderItem.price, 0);
    let discountType = this.selectedItem.discountType;
    let price = this.selectedItem.price;
    let discount = this.selectedItem.discount;
    if (this.offerVariants) {
      this.offerVariants.forEach(variant => {
        if (variant.offerId === parseInt(this.getControl('offerVariants', 'radioVariantsFg').value, 10)) {
          discountType = variant.discountType;
          price = variant.price;
          discount = variant.discount;
        }
      });
    }
    switch (discountType) {
      case 'MONETARY':
        return price - discount + childOfferPrice;
      case 'PERCENTILE':
        return (price * (1 - (discount / 100))) + childOfferPrice;
      default:
        return price + childOfferPrice;
    }
  }

  getCurrentItemFullPrice() {
    if (!this.selectedItem) { return 0; }
    let price = this.selectedItem.price;
    if (this.offerVariants) {
      this.offerVariants.forEach(variant => {
        if (variant.offerId === parseInt(this.getControl('offerVariants', 'radioVariantsFg').value, 10)) {
          price = variant.price;
        }
      });
    }
    price += this.childSelectedCheckboxOfferItems
      .filter(({ price: prc }) => prc)
      .reduce((prc, orderItem) => prc + orderItem.price * (orderItem.quantity ? orderItem.quantity : 1), 0);
    price += this.childSelectedRadioOfferItems.filter(({ price: prc }) => prc).reduce((prc, orderItem) => prc + orderItem.price, 0);
    return price;
  }

  getCurrentItemDiscount() {
    let item: Offer | OfferVariant = this.selectedItem;
    if (this.offerVariants) {
      this.offerVariants.forEach(variant => {
        if (variant.offerId === parseInt(this.getControl('offerVariants', 'radioVariantsFg').value, 10)) {
          item = variant;
        }
      });
    }
    if (!item || (item && !item.discount)) { return false; }
    switch (item.discountType) {
      case 'MONETARY':
        return item.discount;
      default:
        return (1 - (item.discount / 100));
    }
  }

  OnDecreaseQty() {
    if (this.qty > 1 && !this.addToCartDisabled) {
      --this.qty;
    }
  }

  OnIncreaseQty() {
    if (this.qty < this.maxItemQty && !this.addToCartDisabled) {
      ++this.qty;
    }
  }

  setCheckboxTouched(offerItem: any) {
    if (!this.childTouchedCheckboxOfferItems.some(item => item.offerId === offerItem?.offerId)) {
      this.childTouchedCheckboxOfferItems.push(offerItem);
    }
  }

  updateChildSelectedCheckboxOfferItems(offer, quantity: number) {
    this.setCheckboxTouched(offer);
    const offerIndex = this.childSelectedCheckboxOfferItems.findIndex((offerItem) => offerItem.offerId === offer.offerId);
    if (quantity === 0) {
      if (offerIndex !== -1) {
        this.childSelectedCheckboxOfferItems.splice(offerIndex, 1);
      }
    } else {
      if (offerIndex === -1) {
        this.childSelectedCheckboxOfferItems.push({ ...offer, quantity });
      } else {
        this.childSelectedCheckboxOfferItems[offerIndex].quantity = quantity;
      }
    }
  }

  decreaseItemQuantity(offer) {
    const qty = this.getControl('var' + offer.offerId, 'radioCategoriesFg').value;
    if (+qty <= 0) { return; }
    this.getControl('var' + offer.offerId, 'radioCategoriesFg').setValue(qty - 1);
    this.updateChildSelectedCheckboxOfferItems(offer, qty - 1);
  }

  increaseItemQuantity(offer) {
    const qty = this.getControl('var' + offer.offerId, 'radioCategoriesFg').value;
    this.getControl('var' + offer.offerId, 'radioCategoriesFg').setValue(qty + 1);
    this.updateChildSelectedCheckboxOfferItems(offer, qty + 1);
  }


  OnToggleChildOfferPrice($event, offerItem) {
    this.setCheckboxTouched(offerItem);
    if ($event.target.checked === true) {
      this.childSelectedCheckboxOfferItems.push(offerItem);
    } else {
      this.childSelectedCheckboxOfferItems.forEach((childOfferItem, key) => {
        if (childOfferItem.offerId === offerItem.offerId) {
          this.childSelectedCheckboxOfferItems.splice(key, 1);
        }
      });
    }
  }

  OnToggleSingleChildOfferPrice($event, offerItem, categoryId) {
    this.setCheckboxTouched(offerItem);
    if (this.radioCategoriesFg.get('var' + offerItem.offerId).value === false) {
      this.radioCategoriesFg.get('var' + offerItem.offerId).setValue('');
    } else {
      this.radioCategoriesFg.get('var' + offerItem.offerId).setValue(offerItem.offerId);
    }
    this.childCheckboxAsRadioOfferItemsList[categoryId].forEach(item => {
      if (offerItem.offerId !== item) {
        this.radioCategoriesFg.get('var' + item).setValue('');
        // remove any other options from this category that may be selected
        this.childSelectedCheckboxOfferItems = this.childSelectedCheckboxOfferItems.filter(value => value.offerId !== item);
      }
    });
    if ($event.target.checked === true) {
      this.childSelectedCheckboxOfferItems.push(offerItem);
    } else {
      this.childSelectedCheckboxOfferItems.forEach((childOfferItem, key) => {
        if (childOfferItem.offerId === offerItem.offerId) {
          this.childSelectedCheckboxOfferItems.splice(key, 1);
        }
      });
    }
  }

  OnRequireChildOfferPrice(catId, offerItem) {
    this.childSelectedRadioOfferItems[catId] = offerItem;
  }

  OnAddToCart() {
    if ((this.specialNoteFg && !this.specialNoteFg.valid)
      || (this.radioCategoriesFg && !this.radioCategoriesFg.valid)
      || (this.radioVariantsFg && !this.radioVariantsFg.valid)) {
      return;
    }
    if (this.IsAddToCartDisabled()) {
      return;
    }
    const childItemRequests: any[] = [];
    if (this.offerVariants) {
      this.offerVariants.forEach((variant, key) => {
        if (this.getControl('offerVariants', 'radioVariantsFg') != null
          && variant.offerId === parseInt(this.getControl('offerVariants', 'radioVariantsFg').value, 10)) {
          if (key > 0) {
            childItemRequests.push(
              {
                offerId: variant.offerId,
                quantity: this.qty
              }
            );
          }
        }
      });
    }
    if (this.radioCategoriesFg && this.radioCategoriesFg.value) {
      Object.keys(this.radioCategoriesFg.controls).forEach(key => {
        if (this.radioCategoriesFg.controls[key] && this.radioCategoriesFg.controls[key].value) {
          const offerId = parseInt((key.indexOf('cat') !== -1) ? this.radioCategoriesFg.controls[key].value : key.replace('var', ''), 10);
          const childCategory = this.categories.find((category) =>
            category.offers?.find((offer) => offer.offerId === offerId));
          let quantity = '1';
          if (childCategory && childCategory.orderMultipleSameItem) {
            quantity = this.radioCategoriesFg.controls[key].value;
          }
          childItemRequests.push(
            {
              offerId,
              quantity: parseInt((key.indexOf('cat') === -1) ? quantity : '1', 10),
            }
          );
        }
      });
    }
    const wishTime = this.selectedStore.settings.WISH_DATE_PER_ORDER_ITEM === 'ENABLED' ? this.deliveryTime?.startTime : null;
    this.isOrderItemAdding = true;

    this.store.dispatch(new AddOrderItem(this.selectedStore.id, this.currentCartUuid, {
      offerId: this.selectedItem.offerId,
      quantity: this.qty,
      comment: this.getControl('specialNote').value,
      childItemRequests,
      wishTime
    }));
  }

  OnUpdateCart() {
    if (!this.specialNoteFg.valid || !this.radioCategoriesFg.valid) {
      return;
    }
    const childItemRequests: any[] = [];
    if (this.offerVariants) {
      this.offerVariants.forEach((variant, key) => {
        if (variant.offerId === parseInt(this.getControl('offerVariants', 'radioVariantsFg').value, 10)) {
          if (key > 0) {
            childItemRequests.push(
              {
                offerId: variant.offerId,
                quantity: this.qty
              }
            );
          }
        }
      });
    }
    if (this.radioCategoriesFg.value) {
      Object.keys(this.radioCategoriesFg.controls).forEach(key => {
        if (this.radioCategoriesFg.controls[key].value) {
          const offerId = parseInt((key.indexOf('cat') !== -1) ? this.radioCategoriesFg.controls[key].value : key.replace('var', ''), 10);
          const childCategory = this.categories
            .filter((category) => category.offers != null)
            .find((category) => category.offers.find((offer) => offer.offerId === offerId));
          let quantity = '1';
          if (childCategory && childCategory.orderMultipleSameItem) {
            quantity = this.radioCategoriesFg.controls[key].value;
          }
          childItemRequests.push(
            {
              offerId,
              quantity: parseInt((key.indexOf('cat') === -1) ? quantity : '1', 10),
            }
          );
        }
      });
    }
    const wishTime = this.selectedStore.settings.WISH_DATE_PER_ORDER_ITEM === 'ENABLED' ? (this.orderItemInView?.wishTime ?? this.deliveryTime?.startTime) : null;
    this.store.dispatch(new UpdateOrderItem(this.selectedStore.id, this.currentCartUuid, this.orderItemInView.uuid, {
      offerId: this.selectedItem.offerId,
      quantity: this.qty,
      comment: this.getControl('specialNote').value,
      wishTime,
      childItemRequests
    }));
  }

  OnRemoveFromCart(event) {
    event.preventDefault();
    const itemUuid = this.selectedItemUuid();
    if (itemUuid) {
      this.store.dispatch(new RemoveOrderItem(this.selectedStore.id, this.currentCartUuid, itemUuid));
    }
  }

  IsAddedToCart() {
    let ret = false;
    let qty = 1;
    let currentItem = null;
    if (this.cartItems && this.selectedItem && this.selectedOrderUuid) {
      this.cartItems.forEach(item => {
        if (item.offerId === this.selectedItem.offerId && item.uuid === this.selectedOrderUuid) {
          currentItem = item;
          qty = item.quantity;
          ret = true;
        }
      });
    }
    this.orderItemInView = currentItem;
    this.qty = qty;
    return ret;
  }

  selectedItemUuid() {
    let ret = null;
    if (this.cartItems && this.selectedItem) {
      this.cartItems.forEach(item => {
        if (item.offerId === this.selectedItem.offerId) {
          ret = item.uuid;
        }
      });
    }
    return ret;
  }

  getLongDescription(content: string, numOfChar: number) {
    return `${this.getExcerpt(content, numOfChar).excerpt} <span class="excerpt-remainder">${this.getExcerpt(content, numOfChar).reminder}</span>`;
  }

  private getExcerpt(content: string, numOfChar: number) {
    return this.helper.getExcerpt(content, numOfChar);
  }

  OnExpandLongDescription(event) {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      let url = event.target.getAttribute('href');
      if (!url.startsWith('http://') && !url.startsWith('ftp://') && !url.startsWith('file://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
      return;
    }
    const target = event.target || event.srcElement || event.currentTarget;
    target.classList.add('full');
  }

  getBackgroundImage(url, fallbackUrl) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
    }
    return this.sanitizer.bypassSecurityTrustStyle(`url('${fallbackUrl}')`);
  }

  // scrolling
  scrollCalc() {
    this.showStickyScroll = this.helper.scrollCalc();
    this.innerHeight = this.helper.calcInnerHeight();
  }

  scrollPage() {
    this.helper.scrollPage();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.modalShown = false;
  }
  isAllergenSeleted(attributes, name) {
    const attr = attributes.find(item => item.key === name);
    return attr ? attr.value : false;
  }
  scrollExist() {
    return this.helper.scrollCalc(this.scrollableContainer);
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.openModal(), 45000);
  }
  async navigateToOrderCapture() {
    this.router.navigateByUrl(this.locationService.public_url(), { state: { clearCart: true } });

  }
  async reloadFunction() {
    location.reload();
  }
  async navigateReload() {
    await this.navigateToOrderCapture();
    await this.reloadFunction();
  }
  @HostListener('window:mousemove') // you can add more events here
  refreshUserState() {
    clearTimeout(this.userActivity);
    if (this.selectedStore.settings.INACTIVITY_OPTION && this.modalShown) {
      this.setTimeout();
    }
  }
  openModal(): void {
    if (this.modalShown) {
      const dialogRef = this.dialog.open(InactivityModalComponent, {
        width: '400px',
      });

      dialogRef.afterClosed().subscribe((value) => {
        if (value === false) {
          this.modalShown = false;
          this.cookieService.delete('orderUuid-' + (this.locationService.isAdminOrderUpdate() ? 'admin-' : '') + this.selectedStore.aliasName, '/');
          this.navigateReload();
        } else {
        }
      });
    }
  }

  shouldDisplayDateSelection(): boolean {
    return this.selectedStore?.settings?.WISH_DATE_PER_ORDER_ITEM === 'ENABLED' && this.orderItemInView?.wishTime == null;
  }

  shouldDisplaySlotSelection(): boolean {
    return !StoreUtils.isAsapOrderEnabled(this.selectedStore, this.selectedStore?.settings?.DEFAULT_DELIVERY_MODE);
  }

  onDateChanged(date: Slot) {
    this.deliveryTime = date;
    if (
      DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE] &&
      this.selectedStore.settings['DELIVERY_' + DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE],{
        src: 'StoreItemDetailsComponent',
        description: 'Date changed'
      }));
    }
    this.store.dispatch(
      new FetchSlots(
        this.selectedStore.id,
        this.selectedStore.settings.DEFAULT_DELIVERY_MODE || 'NO_LOCATION',
        this.deliveryTime.startTime,
        {
          src: 'StoreItemDetailsComponent',
          description: 'Date changed',
        }
      )
    );
  }

  onSelectedSlotChanged(selectedSlot: Slot) {
    this.deliveryTime = selectedSlot;
    // Needs to be done in the following order, first 'deliveryMethod' then 'wishTime'
    if (
      DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE] &&
      this.selectedStore.settings['DELIVERY_' + DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE], {
        src: 'StoreItemDetailsComponent',
        description: 'Slot changed'
      }));
    }
    if (!this.deliveryTime.startTime) {
      return;
    }
    this.store.dispatch(
      new AddOrderMeta('wishTime', dayjs(this.deliveryTime.startTime).toISOString(), {
        src: 'StoreItemDetailsComponent',
        description: 'Slot changed',
      })
    );
    this.store.dispatch(new SlotSelected(selectedSlot));
  }

  isTimeShowDisabled() {
    return this.checkoutService.isTimeShowDisabled();
  }

}
