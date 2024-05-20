import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ClientStore, Order, LocationValid, OrderItem, Availability } from 'src/app/stores/stores';
import { Store } from '@ngrx/store';
import { Cart, OrderMetaData, OrderMetaState, ZoneState } from '../+state/stores.reducer';
import {
  getCurrentCartUuid,
  getCurrentCartState,
  getStoreLocationsState,
  getCurrentOrderMetaState,
  getCheckoutState,
  getSelectedStore,
  getZoneState,
  getStoreRules,
  getSelectedStoreOpeningHours
} from '../+state/stores.selectors';
import { LocationService } from '../../location.service';
import { AddCheckoutState, AddRuleOrderItem, AddOrderItems, AddOrderMeta, ErrorMessage } from '../+state/stores.actions';
import { FormatPrice } from 'src/app/shared/format-price.pipe';
import { DELIVERY_METHODS, DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import { SpecialSchedule } from 'src/app/stores/store-schedule/stores-schedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { Event } from 'src/app/stores/event';
import { environment } from 'src/environments/environment';
import { AbstractControl } from '@angular/forms';
import { OrderingSetting } from 'src/app/stores/+state/stores.reducer';
import { CustomerAuthService } from '../../customer-auth.service';

export const PICKUP_METHOD = {
  UNDEFINED: -1,
  AT_LOCATION: 0,
  MY_SELF: 1,
  AT_ADDRESS: 2,
};
export const PAYMENT_OPTION = {
  UNDEFINED: -1,
  PAY_LATER: 0,
  PAY_NOW: 1,
};
export const PAYMENT_METHOD = {
  UNDEFINED: -1,
  STRIPE: 0,
  PAYPAL: 1,
  SQUARE: 4,
  VIVA: 5,
  PAYMENTSENSE: 7,
  RMS: 8,
  JCC: 9,
  TRUSTPAYMENTS: 10,
  PAYAPL: 11,
  GLOBALPAY: 12,
  MOLLIE: 13,
  FYGARO: 14,
  EPAY: 15,
  APCOPAY: 16,
  HOBEX: 17
};

export const EMAIL_STATUS = {
  UNDEFINED: -1,
  FAILED: 0,
  SUCCESS: 1,
  SENDING: 2,
};

export const ORIGIN_TYPE = {
  APP: "APP",
  WEB: "WEB"
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  storeRules;
  selectedStore: ClientStore;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  cartData: Order;
  cartStatus: string;
  cartItems: OrderItem[];
  storeLocation: string | number;
  orderMetaData: OrderMetaState;
  orderUuid: string;
  selectedPickupMethod: number;
  selectedPaymentOption: number;  // id of payment method: -1 - undefined; 0 - pay later; 1 - pay now
  selectedPaymentMethod: number;  // id of payment method: -1 - undefined; 0 - I will pay in store; 1 - I will pay online
  selectedDigitalPaymentMethod: string;
  validLocations: LocationValid = null;
  private checkoutStateData;
  private checkoutStatus: string;
  private OrderBtnDisabled: boolean;
  addToCartDisabled: boolean;
  zoneStateData: ZoneState;
  private jccError = true;
  private applicableStoreRules = [];
  private applicableFeeRules = [];
  private storeOpeningHours: SpecialSchedule = null;

  checkoutReady = false;

  constructor(
    private store: Store<Cart>,
    private locationService: LocationService,
    private formatPricePipe: FormatPrice,
    private customerAuthService: CustomerAuthService) {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);
    this.addToCartDisabled = true;

    this.store.select(getSelectedStoreOpeningHours)
      .subscribe((value) => {
        this.storeOpeningHours = value;
      });
    this.store.select(getStoreRules)
      .subscribe(value => {
        if (value && value.storeRulesState && value.storeRulesState.storeRules) {
          this.storeRules = value.storeRulesState.storeRules;
        }
      });

    combineLatest([
      this.store.select(getSelectedStore)
      , this.store.select(getCurrentCartUuid)
      , this.store.select(getCurrentCartState)
      , this.store.select(getStoreLocationsState)
      , this.store.select(getCurrentOrderMetaState)
    ])
      .subscribe(state => {
        if (state && state[0]) {
          this.selectedStore = state[0];
          if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
            this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
              + '-'
              + this.selectedStore.address.country.code;
            this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
            this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
          }
        }
        if (state && state[1]) {
          this.orderUuid = state[1];
        }
        if (state && state[2]) {
          this.cartData = state[2];
          this.cartItems = this.cartData.orderItems;
        }
        if (state && this.selectedStore && this.orderUuid && state[3]) {
          this.validLocations = state[3];
        }
        if (state[4]) {
          this.orderMetaData = state[4];
        }
      });

    // get checkout state
    this.store.select(getCheckoutState)
      .subscribe(d => {
        if (d.checkoutState) {
          this.checkoutStatus = d.checkoutState.status;
          this.checkoutStateData = d.checkoutState.data;
          if (this.checkoutStateData) {
            this.OrderBtnDisabled = this.checkoutStateData.orderBtnDisabled;
          }
        }
      });

    // get zone state
    this.store.select(getZoneState)
      .subscribe(d => {
        if (d.zoneState) {
          this.zoneStateData = d.zoneState;
        }
      });
  }

  /**
   * TODO: setters should NOT be publically available
   */
  setOrderMetaState(k: string, v: string | number, e?: Event) {
    this.store.dispatch(new AddOrderMeta(k, v, e));
  }

  setCheckoutState(k: string, v: string | boolean | number, e?: Event) {
    this.store.dispatch(new AddCheckoutState(k, v, e));
  }

  getSelectedDigitalPaymentMethod() {
    return this.selectedDigitalPaymentMethod;
  }

  setSelectedDigitalPaymentMethod(selectedDigitalPaymentMethod: string) {
    this.selectedDigitalPaymentMethod = selectedDigitalPaymentMethod;
  }

  setJccError(v: boolean) {
    this.jccError = v;
  }

  setApplicableStoreRulesToInit() {
    this.applicableStoreRules = [];
  }

  setApplicableFeeRulesToInit() {
    this.applicableFeeRules = [];
  }

  setApplicableStoreRule(rule) {
    this.applicableStoreRules.push(rule);
  }

  setApplicableFeeRule(rule) {
    this.applicableFeeRules.push(rule);
  }

  /**
   * Total is hidden only when all items are 0 AND total is 0
   */
  shouldDisplayTotal() {
    if (!!this.cartItems) {
      for (const item of this.cartItems) {
        if (item.totalNonDiscountedPrice !== 0) {
          return true;
        }
      }
      const total = this.getCartTotal();
      return (total === 0) ? false : true;
    } else {
      return false;
    }
  }


  /**
   * GETTERS
   */
  getCartTotal(itemsOnly = false, includeRules = false) {
    let ret = 0;
    if (this.cartItems) {
      this.cartItems.forEach(item => {
        if (includeRules && item.hierarchyLevel !== 'RULE_DELIVERY_FEE' || (!includeRules && !this.ifOfferRule(item.offerId))) {
          ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
        }
      });
      if (!itemsOnly) {
        if (this.selectedStore &&
          ((this.getOrderFeeDelivery() && this.ifOnlyDeliveryToAddress())
            || (this.getOrderFeeDelivery() && this.getPickupMethodAsInt() === 2))
        ) {
          ret += this.getOrderFeeDelivery();
        }
        if (this.cartData.voucherDiscount) {
          ret = ret - this.cartData.voucherDiscount;
        }
      }
    }
    return ret;
  }

  getCartTotalWithoutVoucher(includeRules = false) {
    let ret = 0;
    if (this.cartItems) {
      this.cartItems.forEach(item => {
        if (includeRules && item.hierarchyLevel !== 'RULE_DELIVERY_FEE' || (!includeRules && !this.ifOfferRule(item.offerId))) {
          const qty = item.quantity;
          ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
        }
      });
      if (this.selectedStore && this.getOrderFeeDelivery()) {
        ret += this.getOrderFeeDelivery();
      }
      if(this.getOrderServiceCharge()) {
        ret += this.getOrderServiceCharge();
      }
    }
    return ret;
  }

  getCartDiscountedPrice() {
    let ret = 0;
    if (this.cartData && this.cartData.voucherDiscount) {
      ret = this.cartData.totalDiscountedPrice;
    }
    return ret;
  }

  getCartDiscountType() {
    if (this.cartData && this.cartData.voucherDiscount) {
      return this.cartData.voucherDiscountType;
    }
    return null;
  }

  getCartDiscountValue() {
    if (this.cartData && this.cartData.voucherDiscount) {
      return this.cartData.voucherDiscount;
    }
    return null;
  }

  // This function is only called when voucher discount type is percentile...
  getCartDiscountPercentage() {
    if (this.cartData && this.cartData.voucherDiscountPercentage) {
      return this.cartData.voucherDiscountPercentage;
    }
    return null;
  }

  getFormattedMinAmount() {
    if (this.selectedStore) {
      return this.formatPricePipe.transform(
        this.getOrderMinAmountDelivery(),
        this.selectedStoreLocale,
        this.selectedStoreCurrency,
        this.selectedStoreCurrencySymbol
      );
    }
    return '';
  }
  getLocationInitiallyPersisted() {
    return this.checkoutStateData.locationInitiallyPersisted;
  }
  getOrderMetaData(k: string) {
    if (this.orderMetaData && this.orderMetaData.data[k]) {
      return this.orderMetaData.data[k];
    }
    return '';
  }
  getCheckoutMetaData(k: string) {
    if (this.checkoutStateData && this.checkoutStateData[k]) {
      return this.checkoutStateData[k];
    }
    return '';
  }
  getCheckoutMetaDataValue(k: string) {
    if (this.checkoutStateData && (k in this.checkoutStateData)) {
      return this.checkoutStateData[k];
    }
    return '';
  }
  /**
   * check if CheckoutMetaData key is set to any value
   * @param k CheckoutMetaData key
   */
  isCheckoutMetaData(k: string) {
    if (this.checkoutStateData && (k in this.checkoutStateData)) {
      return true;
    }
    return false;
  }

  // payment getters
  getPickupMethod() {
    return this.orderMetaData.data.deliveryMethod;
  }
  getPickupMethodStr() {
    if (this.orderMetaData?.data.deliveryMethod) {
      return DELIVERY_METHODS[this.orderMetaData.data.deliveryMethod];
    } else {
      return null;
    }
  }
  getPickupMethodAsInt() {
    return parseInt(this.orderMetaData.data.deliveryMethod, 10);
  }

  deliveryFeeApply(){
    return this.cartData?.deliveryFeeApply;
  }

  locationDeliveryFeeApply() {
    return this.validLocations?.deliveryFeeApply;
  }

  getPickupMethodAsIntFrom(deliveryMethod: string) {
    return parseInt(DELIVERY_METHOD_VALUES[deliveryMethod], 10);
  }
  getStoreLocation() {
    return this.checkoutStateData.storeLocation;
  }

  getPaymentOptions() {
    return this.orderMetaData.data.paymentOption;
  }

  getPaymentMethod() {
    return this.orderMetaData.data?.paymentMethod;
  }

  getApplicableStoreRules() {
    return this.applicableStoreRules;
  }

  getApplicableFeeRules() {
    return this.applicableFeeRules;
  }

  getOrderSubmitErrors() {
    return this.checkoutStateData.orderSubmitError.errors;
  }

  // EOF: getters

  validCartLocation() {
    if (this.cartData.location && this.cartData.location !== -1) {
      return true;
    }
    return false;
  }
  validateCartLocation() {
    if (!this.validLocations && this.cartData.location && !this.orderMetaData) {
      return true;
    }
    return false;
  }
  getValidLocations() {
    return this.validLocations;
  }
  isValidLocation() {
    return (this.validLocations && this.validLocations.isValid);
  }

  isSettingsEnabled() {
    return 'yes';
  }

  isShowReadOnlyLocation() {
    if (this.ifOnlyInStore() ||
      this.showReadOnlyLocation() ||
      this.showEditableLocation() ||
      this.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION) {
      return true;
    }
    return false;
  }

  isShowOnlySelfPickup() {
    if (this.ifOnlySelfPickup() ||
      this.ifEnabledSelfPickup() &&
      this.getPickupMethodAsInt() === PICKUP_METHOD.MY_SELF) {
      return true;
    }
    return false;
  }

  isShowOnlyDeliveryToAddress() {
    if (this.ifOnlyDeliveryToAddress() ||
      this.ifEnabledDeliveryAtAddress() &&
      this.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS) {
      return true;
    }
    return false;
  }

  showReadOnlyLocation() {
    if (this.ifEnabledInStorePickup()
      && !this.ifOnlySelfPickup()
      && !this.ifOnlyDeliveryToAddress()
      && this.locationService.getUrlStoreLocation()
      && (this.getValidLocations() && this.getValidLocations().label === this.locationService.getUrlStoreLocation())) {
      return true;
    }
    return false;
  }

  showEditableLocation() {
    if (this.ifEnabledInStorePickup() && (this.getPickupMethodAsInt() === 0 && this.showChoices()) ||
      (this.ifOnlyInStore() &&
        (!this.locationService.getUrlStoreLocation() ||
          (
            this.locationService.getUrlStoreLocation() &&
            this.getValidLocations() &&
            this.getValidLocations().label !== this.locationService.getUrlStoreLocation()
          )
        )
      )
    ) {
      return true;
    }
    return false;
  }

  showChoices() {
    if (this.ifOnlyInStore() || this.ifOnlySelfPickup() || this.ifOnlyDeliveryToAddress()){
      return false;
    }
    if (!this.showReadOnlyLocation()
      && this.ifEnabledMultiplePickupOptions()) {
      return true;
    }
    return false;
  }

  // atm we are actually not showing any delivery options if only self pickup is available
  showOnlySelfPickup() {
    if (!this.getStoreLocation() || !this.getLocationInitiallyPersisted() || !!this.cartData.location && this.ifOnlySelfPickup()) {
      return true;
    }
    return false;
  }

  // atmm we are actually not showing any delivery options if only delivery to address is available
  showOnlyDeliveryToAddress() {
    if (!this.getStoreLocation() || !this.getLocationInitiallyPersisted() || !!this.cartData.location && this.ifOnlyDeliveryToAddress()) {
      return true;
    }
    return false;
  }

  storeAvailabilitiesInDay(day: string) {
    // If daysOfWeek is null we assume the schedule applies to all days in week
    return this.storeOpeningHours
                ?.schedule
                ?.availabilities
                ?.filter(a => a.type === 'DAYS_OF_WEEK' &&
                  (!a.daysOfWeek || a.daysOfWeek.includes(day)));
  }

  ifStoreClosed() {
    return !this.isStoreOpen();
  }

  isClosedForOrdering(){
    return this.ifStoreClosed() && !this.isFutureOrderingEnabled();
  }

  isStoreOpen(){
    if (!this.storeOpeningHours) {
      return true;
    }

    const dateSchedule = this.storeOpeningHours.schedule.availabilities
      .filter(a => a.date != null)
      .find(a => this.currentStoreTime.isSame(a.date, 'day')  &&
        this.currentStoreTime.isBetween(
          this.storeOpeningTime(dayjs(), a),
          this.storeClosingTime(dayjs(), a),
          'minute',
          '[]'
        )
      );

    if (dateSchedule){
      if (dateSchedule.type === 'DATE_INCLUSIVE'){
        return dateSchedule;
      }
      if (dateSchedule.type === 'DATE_EXCLUSIVE'){
        return null;
      }
    }

    const storeSchedulesForDay = this.storeAvailabilitiesInDay(this.currentStoreTime.format('ddd').toUpperCase());
    const openNow = storeSchedulesForDay.find(
      s => this.currentStoreTime.isBetween(
        this.storeOpeningTime(dayjs(), s),
        this.storeClosingTime(dayjs(), s),
        'minute', '[]'
      )
    );

    return openNow;
  }

  /**
   * Return current time in store's timezone
   */
  private get currentStoreTime() {
    return dayjs();
  }

  private storeOpeningTime(date: dayjs.Dayjs, availability: Availability) {
    const openingTime = this.storeAvailabilityStart(availability);
    const openingDate = date.hour(openingTime.hour).minute(openingTime.minute).second(openingTime.second);
    return this.toStoreTimezone(openingDate);
  }

  private storeClosingTime(date: dayjs.Dayjs, availability: Availability) {
    const closingTime = this.storeAvailabilityEnd(availability);
    const closingDate = date.hour(closingTime.hour).minute(closingTime.minute).second(closingTime.second);
    return this.toStoreTimezone(closingDate);
  }

  private toStoreTimezone(date: dayjs.Dayjs){
    return this.selectedStore.timeZone ? date.tz(this.selectedStore.timeZone, true) : date;
  }

  private storeAvailabilityStart(availability: Availability) {
    const startTime = [...availability.startTime.split(':')];
    return {hour: +startTime[0], minute: +startTime[1], second: +startTime[2]};
  }

  private storeAvailabilityEnd(availability: Availability) {
    const endTime = [...availability.endTime.split(':')];
    return {hour: +endTime[0], minute: +endTime[1], second: +endTime[2]};
  }

  ifEnabledOrder() {
    if (!this.selectedStore || !this.selectedStore.subscription || this.selectedStore.subscription.status === 'TRIAL_EXCEEDED') {
      return false;
    }

    if (this.selectedStore && this.selectedStore.settings && this.selectedStore.settings.ENABLE_ORDERING) {
      return this.selectedStore.settings.ENABLE_ORDERING;
    }

    return false;
  }

  ifEnabledOrderCapture(){
    if (this.selectedStore && this.selectedStore.settings && this.selectedStore.settings.ENABLE_ORDER_CAPTURE){
      return this.selectedStore.settings.ENABLE_ORDER_CAPTURE;
    }
    return false;
  }

  ifNoDeliverySupported() {
    if (this.selectedStore
      && this.selectedStore.settings
      && !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION
      && !this.selectedStore.settings.DELIVERY_NO_LOCATION
      && !this.selectedStore.settings.DELIVERY_ADDRESS) {
      return true;
    }
    return false;
  }
  ifNoDeliveryAvailable() {
    if (this.selectedStore
      && this.selectedStore.settings
      && !this.ifEnabledInStorePickup()
      && !this.ifEnabledSelfPickup()
      && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlySelfPickup() {
    if (this.selectedStore
      && this.selectedStore.settings
      && !this.ifEnabledInStorePickup()
      && this.ifEnabledSelfPickup()
      && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlyInStore() {
    if (this.selectedStore
      && this.selectedStore.settings
      && this.ifEnabledInStorePickup()
      && !this.ifEnabledSelfPickup()
      && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlyDeliveryToAddress() {
    if (this.selectedStore
      && this.selectedStore.settings
      && !this.ifEnabledInStorePickup()
      && !this.ifEnabledSelfPickup()
      && this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifEnabledMultiplePickupOptions() {
    if (this.selectedStore && this.selectedStore.settings) {
      if (this.helperAtLeastTwo(this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION
        , this.selectedStore.settings.DELIVERY_NO_LOCATION
        , this.selectedStore.settings.DELIVERY_ADDRESS)) {
        return true;
      }
    }
    return false;
  }
  helperAtLeastTwo(a: boolean, b: boolean, c: boolean) {
    return a ? (b || c) : (b && c);
  }

  focusField(event) {
    const closestInput = this.closestInput(event.target);
    if (closestInput) {
      closestInput.focus();
    }
  }

  closestInput(target) {
    const expectedTypes = ['TEXTAREA', 'INPUT'];
    if (!target) {
      return null;
    }
    if (target && expectedTypes.includes(target.nodeName)) {
      return target;
    }
    if (!target.previousSibling && target.parentNode) {
      return this.closestInput(target.parentNode);
    }
    return this.closestInput(target.previousSibling);
  }

  /**
   * check if payment is enabled
   */
  ifEnabledPayment() {
    if ((this.selectedStore
      && this.selectedStore.settings
      && this.selectedStore.settings.PAYMENT_OPTION === 'disabled')
      || this.countEnabledPaymentMethods() === 0) {
      return false;
    }
    return true;
  }

  /**
   * check if payment is enabled and optional
   */
  ifEnabledPaymentSelection() {
    if (this.selectedStore
      && this.selectedStore.settings
      && this.selectedStore.settings.PAYMENT_OPTION === 'optional'
      && this.countEnabledPaymentMethods() !== 0) {
      return true;
    }
    return false;
  }

  /**
   * check if payment is enabled and mandatory
   */
  ifEnabledPaymentMandatory() {
    if (this.selectedStore
      && this.selectedStore.settings
      && this.selectedStore.settings.PAYMENT_OPTION === 'mandatory'
      && this.countEnabledPaymentMethods() !== 0) {
      // set payment option to pay now
      // this.setPaymentOption(1);
      return true;
    }
    return false;
  }

  /**
   * check if payment is enabled, optional & preselected
   */
  ifEnabledPaymentSelectionPreselected() {
    return (this.ifEnabledPaymentSelection() && this.selectedStore.settings.OPTIONAL_PAYMENT_PRESELECTED);
  }

  /**
   * count available payment methods
   */
  countEnabledPaymentMethods() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return 0;
    }
    const $this = this;
    let multiple = 0;
    Object.keys(PAYMENT_METHOD).forEach(method => {
      if ($this.selectedStore.settings[$this.getMethodKey(PAYMENT_METHOD[method])]) {
        multiple++;
      }
    });
    // Special case if JCC CREDIT CARD and STRIPE CREDIT CARD are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and RMS are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and PAYMENTSENSE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and SQUARE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and VIVA are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and TRUSTPAYMENTS are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)]) {
      return multiple;
    }
    // Special case if STRIPE CREDIT CARD and RMS are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and PAYMENTSENSE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and SQUARE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and VIVA are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and TRUSTPAYMENTS are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)]) {
      return multiple;
    }
    // Special case if RMS and PAYMENTSENSE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if RMS and SQUARE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if RMS and VIVA are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    // Special case if RMS and TRUSTPAYMENTS are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]) {
      return multiple;
    }
    // Special case if PAYMENTSENSE CREDIT CARD and SQUARE are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if PAYMENTSENSE CREDIT CARD and VIVA are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    // Special case if PAYMENTSENSE CREDIT CARD and TRUSTPAYMENTS are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]) {
      return multiple;
    }
    // Special case if SQUARE CREDIT CARD and VIVA are enabled then only SQUARE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    // Special case if SQUARE CREDIT CARD and TRUSTPAYMENTS are enabled then only SQUARE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.TRUSTPAYMENTS)]) {
      return multiple;
    }

    return multiple;
  }

  /**
   * return the key for payment method
   * @param method int
   */
  getMethodKey(method) {
    switch (method) {
      case PAYMENT_METHOD.STRIPE:
        return 'PAYMENT_STRIPE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.PAYPAL:
        return 'PAYMENT_PAYPAL_ENABLED';
      case PAYMENT_METHOD.SQUARE:
        return 'PAYMENT_SQUARE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.VIVA:
        return 'PAYMENT_VIVA_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.PAYMENTSENSE:
        return 'PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.RMS:
        return 'PAYMENT_RMS_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.JCC:
        return 'PAYMENT_JCC_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.TRUSTPAYMENTS:
        return 'PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.PAYAPL:
        return 'PAYMENT_PAYABL_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.GLOBALPAY:
        return  'PAYMENT_GLOBAL_PAY_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.MOLLIE:
        return 'PAYMENT_MOLLIE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.FYGARO:
        return 'PAYMENT_FYGARO_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.EPAY:
        return 'PAYMENT_EPAY_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.APCOPAY:
        return 'PAYMENT_APCOPAY_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.HOBEX:
        return 'PAYMENT_HOBEX_CREDIT_CARD_ENABLED';
      default:
        return null;
    }
  }
  /**
   * If delivery-in-store-location = false AND delivery-no-location = true
   * location pickup is disabled
   */
  ifEnabledInStorePickup() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifEnabledSelfPickup() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_NO_LOCATION) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifEnabledDeliveryAtAddress() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_ADDRESS) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifDeliveryMethodEnabled(deliveryMethod: string) {
    if (this.selectedStore && this.selectedStore.settings) {
      switch (deliveryMethod) {
        case 'IN_STORE_LOCATION':
          return this.ifEnabledInStorePickup();
        case 'NO_LOCATION':
          return this.ifEnabledSelfPickup();
        case 'ADDRESS':
          return this.ifEnabledDeliveryAtAddress();
      }
    }
    return false;
  }

  ifCollapsableDisabled() {
    if (this.showChoices() && (isNaN(this.getPickupMethodAsInt()) || this.getPickupMethodAsInt() === -1)) {
      return true;
    }
    return false;
  }

  ifMinimumOrderAmountMet(type = '') {
    if (!this.selectedStore || !this.cartItems || this.cartItems.length === 0) {
      return true;
    }
    if (this.getOrderMinAmountDelivery() === 0) {
      return true;
    }
    const cartTotal = this.getCartTotal(true);
    switch (type) {
      case 'onlyDelivery':
        if (this.ifOnlyDeliveryToAddress()
          && this.getOrderMinAmountDelivery() > cartTotal) {
          return false;
        }
        break;
      case 'deliveryAsOption':
        if ((this.showChoices() && this.ifEnabledDeliveryAtAddress())
          && this.getOrderMinAmountDelivery() > cartTotal) {
          return false;
        }
        break;
      case 'onlyLocation':
          if (this.showReadOnlyLocation() && this.locationDeliveryFeeApply()
            && this.getOrderMinAmountDelivery() > cartTotal) {
            return false;
          }
          break;
      case 'locationAsOption':
        if ((this.showChoices() && this.locationDeliveryFeeApply())
          && this.getOrderMinAmountDelivery() > cartTotal) {
          return false;
        }
        break;
      default:
        const isDeliveryToAddress = this.ifOnlyDeliveryToAddress() ||
          (this.showChoices() && this.ifEnabledDeliveryAtAddress() && this.getPickupMethodAsInt() === 2);

        const isDeliveryToLocation = this.getPickupMethodAsInt() === 0 && this.locationDeliveryFeeApply();

        if (( isDeliveryToAddress || isDeliveryToLocation) && this.getOrderMinAmountDelivery() > cartTotal) {
          return false;
        }
        break;
    }
    return true;
  }

  getZoneRestrictions(): boolean {
    return !!this.selectedStore.settings.DELIVERY_ZONE_RESTRICTION;
  }

  isNotDeliverableAddress(): boolean {
    return this.getZoneRestrictions() && this.zoneStateData.status === 'NOTDELIVERABLE_ADDRESS';
  }

  isNotDeliverablePostCode(): boolean {
    return this.getZoneRestrictions() && this.zoneStateData.status === 'NOTDELIVERABLE_POSTCODE';
  }

  isDeliverable(): boolean {
    return this.getZoneRestrictions() && this.zoneStateData.status === 'DELIVERABLE';
  }

  isGeolocationRequired(): boolean {
    return this.getZoneRestrictions() &&
      this.selectedStore.settings.DELIVERY_ADDRESS_GPS_COORDINATES === 'MANDATORY' &&
      (
        this.ifOnlyDeliveryToAddress() ||
        (this.ifEnabledDeliveryAtAddress() && this.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS)
      );
  }

  getOrderMinAmountDelivery() {
    if (this.zoneStateData?.status === 'DELIVERABLE' && this.zoneStateData.settings?.orderMinAmountDelivery) {
      return this.zoneStateData.settings.orderMinAmountDelivery;
    }
    return this.selectedStore.orderMinAmountDelivery;
  }

  getOrderFreeDelivery() {
    if (this.zoneStateData?.status === 'DELIVERABLE' && this.zoneStateData.settings.orderAmountFreeDelivery) {
      return this.zoneStateData.settings.orderAmountFreeDelivery;
    }
    return this.selectedStore.orderAmountFreeDelivery;
  }

  getOrderFeeDelivery() {
    return this.cartData.deliveryFee;
  }

  getOrderServiceCharge() {
    return this.cartData.serviceChargeAmount;
  }

  /**
   * get the UUID for a store promotion rule added to the cart
   * @param offerId string - id for the offer we want to check if it is a part of store promotion rule
   */
  getOfferRuleUuid(offerId: number) {
    let ret = '';

    if (!this.cartItems) {
      return ret;
    }
    this.cartItems.map(cartItem => {
      if (cartItem.offerId === offerId) {
        ret = cartItem.uuid;
      }
    });

    return ret;
  }

  isRuleValid(ruleIndex) {
    if (this.applicableStoreRules[ruleIndex]) {
      let allConditionsAreTrue = true;
      this.applicableStoreRules[ruleIndex].conditions.forEach(condition => {
        switch (condition.type) {
          case 'ORDER_AMOUNT_RANGE':
            if (this.getCartTotal(true) < condition.data.min
              || this.getCartTotal(true) > condition.data.max) {
              allConditionsAreTrue = false;
            }
            break;
          case 'DELIVERY_MODE':
            if (this.getPickupMethodStr() !== condition.data.deliveryMode) {
              allConditionsAreTrue = false;
            }
            break;
          default:
            // do nothing
            break;
        }
      });
      if (allConditionsAreTrue) {
        // the condition is still valid
        return true;
      }
    }
    // the condition is NO LONGER valid. DO NOT ADD TO CART!
    return false;
  }

  hasStoreRuleOffers() {
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      // I should not be able to get to this point if the storeRuleForm is invalid
      this.store.dispatch(new ErrorMessage('public.global.errorExpected', '501'));
    }
    if (!this.checkoutStateData.storeRuleOffers) {
      return false;
    }
    // update store offer rules - as some rules may have expired
    const validStoreRulesAtCheckout = [];
    this.checkoutStateData.storeRuleOffers.forEach(offer => {
      if (this.storeRules[offer.ruleIndex] && this.isRuleValid(offer.ruleIndex)) {
        validStoreRulesAtCheckout.push(offer);
      }
    });
    this.store.dispatch(new AddCheckoutState('storeRuleOffers', validStoreRulesAtCheckout));
    if (validStoreRulesAtCheckout.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * check if the offer is part of a store promotion rule
   * @param offerId string - id for the offer we want to check if it is a part of store promotion rule
   */
  ifOfferRule(offerId: number) {
    let ret = false;
    this.storeRules.map(rule => {
      rule.actions.map(action => {
        if (action.data.offers) {
          action.data.offers.map(offer => {
            if (offer.offerId === offerId) { ret = true; }
          });
        }
      });
    });
    return ret;
  }

  /**
   * check if the offer is added to cart
   * usually used to determine if a store promotion
   * rule offer is already added to cart
   * @param offerId string - id for the offer we want to check if it is a part of cart items
   */
  ifCartOfferRule(offerId: number) {
    let ret = false;
    if (!this.cartItems) {
      return;
    }
    this.cartItems.map(orderItem => {
      if (orderItem.offerId === offerId) {
        ret = true;
      }
    });
    return ret;
  }

  /**
   * check if the offer is added to cart
   * usually used to determine if a store promotion
   * rule offer is already added to cart
   * @param offerId string - id for the offer we want to check if it is a part of cart items
   */
  ifCartOfferRuleMinZeroMaxOne(offerId: number) {
    let ret = false;
    const rules = this.getApplicableStoreRules();
    rules.map(rule => {
      rule.actions.map(action => {
        if (action.data
          && action.data.min !== undefined && action.data.min === 0
          && action.data.max !== undefined && action.data.max === 1) {
          action.data.offers.map(offer => {
            if (offer.offerId === offerId) {
              ret = true;
            }
          });
        }
      });
    });

    return ret;
  }

  /**
   * for now we are depercating this mechanism of adding offer rules on submission
   * we will add/persist them on select directly to the order/be
   */
  submitStoreRuleOffers() {
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      // I should not be able to get to this point if the storeRuleForm is invalid
      this.store.dispatch(new ErrorMessage('public.global.errorExpected', '501'));
    }
    if (!this.checkoutStateData.storeRuleOffers) {
      return;
    }
    const payload = [];
    this.checkoutStateData.storeRuleOffers.forEach(offer => {
      if (this.storeRules[offer.ruleIndex] && this.isRuleValid(offer.ruleIndex)) {
        const offerItem = {
          offerId: offer.offerId,
          quantity: offer.quantity,
          comment: ''
        };
        payload.push(offerItem);
        // at the moment it is assumed that only one order item would be added to cart
        // if that isn't the case this will present an issue
        this.store.dispatch(new AddRuleOrderItem(this.selectedStore.id, this.orderUuid, offerItem));
      }
    });
  }

  ifSubmitOrderReady(isAdminOrderUpdate?: boolean) {
    // true if: invalid payment method is selected or checkout options form is invalid
    if (this.OrderBtnDisabled) {
      this.logger("Order button disabled");
      return false;
    }
    // true if: store rules are enabled and there is a required selection which has not been made
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      this.logger("Invalid rules");
      return false;
    }

    if ((this.showEditableLocation() || this.showReadOnlyLocation()) && !this.checkoutStateData.checkoutOptionsFormValid){
      this.logger("Invalid location");
      return false;
    }

    // true if: minimum order amount is met and delivery at address is enabled/available
    if (!this.ifMinimumOrderAmountMet()) {
      this.logger("Minimum order amount not met");
      return false;
    }

    // true if: valid wishtime is provided.
    // a valid wishtime is considered:
    // no wish time selection at all,
    // I want to receive ASAP, or
    // valid timepicker value provided when want to specify it
    if (
      !isAdminOrderUpdate &&
      !this.isCheckoutMetaData('timeSelectionValid') &&
      !this.getCheckoutMetaDataValue('timeSelectionValid')
    ) {
      this.logger("Invalid time selection");
      return false;
    }

    if (
      !isAdminOrderUpdate &&
      this.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS
      && this.getZoneRestrictions()
      && !this.isDeliverable()) {
      this.logger("Invalid zone");
      return false;
    }

    if (
      !isAdminOrderUpdate &&
      (this.ifOnlyInStore() || this.getPickupMethodAsInt() === 0) &&
      !this.isValidLocation()
    ) {
      this.logger("Invalid location");
      return false;
    }

    if (!this.checkoutStateData.personalFormValid) {
      this.logger("Invalid personal form");
      return false;
    }

    if (!(
      ( isAdminOrderUpdate || ( !this.isPaymentComponent() ||
      (this.isPaymentComponent() && this.isPaymentValid())
      )) &&
      this.checkoutStateData.personalFormValid
    )) {
      this.logger("Invalid payment");
      return false;
    }

    return true;
  }

  isPaymentComponent() {
    return ((this.ifEnabledPaymentSelection() || this.ifEnabledPaymentMandatory()) && this.cartData.totalDiscountedPrice > 0);
  }

  isPaymentValid() {
    // Check if payment is not enabled, return true
    if (!this.ifEnabledPayment()) {
      return true;
    }

    // include only valid payment methods
    const validPaymentMethods = ['', ...Object.values(PAYMENT_METHOD)].filter(ps => ps !== PAYMENT_METHOD.UNDEFINED);

    // Check if payment is mandatory and payment method is one of the valid options or empty, return true
    if (this.ifEnabledPaymentMandatory()) {
      return validPaymentMethods.includes(this.getOrderMetaData('paymentMethod'));
    }

    // Check if payment option is enabled and optional, check if payment option is 0 or empty,
    // or payment method is one of the valid options, return true
    if (this.ifEnabledPaymentSelection()) {
      const paymentOption = this.getOrderMetaData('paymentOption');
      const paymentMethod = this.getOrderMetaData('paymentMethod');

      return paymentOption === 0 || paymentOption === '' || (paymentOption > 0 && validPaymentMethods.includes(paymentMethod));
    }

    // If none of the above conditions are met, return false
    return false;
  }


  isTimeShowDisabled() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return false;
    }
    switch (this.getPickupMethodStr()) {
      case 'IN_STORE_LOCATION':
        return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'NO_LOCATION':
        return this.selectedStore.settings.DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'ADDRESS':
        return this.selectedStore.settings.DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE;
    }
    return false;
  }

  isFutureOrderingEnabled() {
    return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE
      || this.selectedStore.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE
      || this.selectedStore.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE;
  }

  isShowParentItemPrice(orderItem: OrderItem) {

    if (orderItem.quantity > 1
      || (orderItem.discountValue !== undefined
        && orderItem.discountValue !== 0)) {
      return true;
    }
    if (orderItem.childOrderItems !== undefined
      && orderItem.childOrderItems.length > 0) {
      let found = false;
      orderItem.childOrderItems.forEach(childOrderItem => {
        if (childOrderItem.offerPrice !== undefined && childOrderItem.offerPrice !== 0) {
          found = true;
        }
      });
      return found;
    }
    return false;
  }

  invalidSubmit(){
    return this.checkoutStatus === 'INVALID_SUBMIT';
  }

  showErrors(control: AbstractControl) {
    return this.invalidSubmit() && control?.errors ;
  }

  isInvalid(control: AbstractControl) {
    return control?.invalid
              && control?.dirty
              && this.invalidSubmit();
  }

  logger(message: string) {
    if (!environment.production) {
      console.log("Checkout Service: ", message);
    }
  }

  allFieldsHiddenForPickup() {
     return !this.customerAuthService.enableCustomerAuth()
      && this.isShowOnlySelfPickup()
      && this.selectedStore.settings.PICKUP_NAME_SELECTION === OrderingSetting.HIDDEN
      && this.selectedStore.settings.PICKUP_EMAIL_SELECTION === OrderingSetting.HIDDEN
      && this.selectedStore.settings.PICKUP_TEL_SELECTION === OrderingSetting.HIDDEN;
  }
}
