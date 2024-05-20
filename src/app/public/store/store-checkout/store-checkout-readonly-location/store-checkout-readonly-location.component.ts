import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelperService } from 'src/app/public/helper.service';
import { ClientStore, Order } from 'src/app/stores/stores';
import {
  AddCheckoutState,
  AddOrderMeta
} from '../../+state/stores.actions';
import { Cart, CustomerDetailsUpdateState, OrderMetaState, ZoneData } from '../../+state/stores.reducer';
import {
  getCheckoutState,
  getCurrentOrderMetaState,
  getSelectedStore
} from '../../+state/stores.selectors';
import { CustomValidators } from '../../../../shared/custom.validators';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';
// import {  } from '@types/googlemaps';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocationService } from 'src/app/public/location.service';
import { OrderingSetting } from 'src/app/stores/+state/stores.reducer';
import { getCustomerInfo } from '../../+state/stores.selectors';
import { CustomerAuthService } from 'src/app/public/customer-auth.service';

@Component({
  selector: 'app-store-checkout-readonly-location',
  templateUrl: './store-checkout-readonly-location.component.html',
  styleUrls: ['./store-checkout-readonly-location.component.scss']
})
export class StoreCheckoutReadOnlyLocationComponent implements OnInit, OnDestroy {
  userLogin: SafeResourceUrl;
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  orderUuid: string;
  PICKUP_METHOD = PICKUP_METHOD;
  validationTimer = null;
  geocodingTimer = null;
  autocomplete: any;
  iframe: any;
  cookieEnabled = false;
  isSociallyLoggedIn = false;
  socialAccountLoginStatus = 'INITIAL';
  customerDetailsUpdateStatus = 'INITIAL';
  ENABLE_CUSTOMER_AUTHENTICATION = 'ENABLE_CUSTOMER_AUTHENTICATION';
  formChanged = false;
  initialFormLoad = false;
  tokenCookieName: string;
  customerDetails: CustomerDetailsUpdateState = {
    userId: -1,
    userName: '',
    email: '',
    phoneNumber: '',
    floorNumber: '',
    streetAddress: '',
    city: '',
    postCode: '',
    customerDetailsUpdateStatus: 'INITIAL',
    tokens: {
      jwt: '',
      refreshToken: ''
    }
  };
  @ViewChild('yourInfoWrapper')  yourInfoWrapper: ElementRef;

  zonedata: ZoneData;

  isAdminOrderCaptureUpdate;

  constructor(private fb: FormBuilder,
              private store: Store<Cart>,
              public checkoutService: CheckoutService,
              public helper: HelperService,
              public sanitizer: DomSanitizer,
              private locationService: LocationService,
              private customerAuthService: CustomerAuthService
             ) { }

  ngOnInit() {
    this.tokenCookieName = this.customerAuthService.tokenCookieName;
    this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();

    this.store.select(getSelectedStore)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
        if (d) {
          this.selectedStore = d;
          this.updateValidationRules();
        }
    });

    // get checkout state
    this.store.select(getCheckoutState)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
        if (d.checkoutState) {
          this.checkoutStateData = d.checkoutState.data;
        }
    });

    this.store.select(getCurrentOrderMetaState)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(d => {
      if (d) {
          this.orderMetaData = d;
          this.updateOrderMetaDataValues();
      }
    });

    if (this.isAdminOrderCaptureUpdate){
      this.store.select(getCustomerInfo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state) {
          const { name, email, phone } = state;
          if (name) {
            if (this.getControl('name')) {
              this.getControl('name').patchValue(name, {onlySelf: true, emitEvent: true});
              this.addOrderMeta('customerName', 'name', 'personalInfoForm');
            }
            this.customerDetails.userName = name;
          }
          if (email) {
            if (this.getControl('email')) {
              this.getControl('email').patchValue(email, {onlySelf: true, emitEvent: true});
              this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
            }
            this.customerDetails.email = email;
          }
          if (phone) {
            if (this.getControl('phone')) {
              this.getControl('phone').patchValue(phone, {onlySelf: true, emitEvent: true});
              this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
            }
            this.customerDetails.phoneNumber = phone;
          }
        }
      });
    }
    this.checkFormValidity();
  } // EOF: ngOnInit



  public get OrderingSetting(): typeof OrderingSetting {
    return OrderingSetting;
  }

  getControl(name: string, form: string = 'personalInfoForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  checkFormValidity() {
    this.store.dispatch(new AddCheckoutState('personalFormValid', this.personalInfoForm.valid));
  }


  addOrderMeta(metaKey, control, formGroup = 'personalInfoForm') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  /**
   * Check if name field should be hidden
   * Currently it only considers when table ordering
   */
  nameFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_NAME === OrderingSetting.HIDDEN;
    }
    return false;
  }

  /**
   * Check if email field should be hidden
   * Currently it only considers when table ordering
   */
  emailFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL === OrderingSetting.HIDDEN;
    }
    return false;
  }

  /**
   * Check if phone field should be hidden
   * Currently it only considers when table ordering
   */
  phoneFieldHidden() {
    if (   this.checkoutService.ifOnlyInStore()
        || this.checkoutService.showReadOnlyLocation()
        || this.checkoutService.showEditableLocation()
        || this.checkoutService.getPickupMethodAsInt() === 0) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_TEL === OrderingSetting.HIDDEN;
    }
    return false;
  }

  nameFieldOptional() {
    if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_NAME === OrderingSetting.MANDATORY) {
      return false;
    }
    return true;
  }

  emailFieldOptional() {
    if (this.isAdminOrderCaptureUpdate) {
      return true;
    }
    if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL === OrderingSetting.MANDATORY) {
      return false;
    } else {
      return true;
    }
  }

  phoneFieldOptional() {
    if ( this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_TEL === OrderingSetting.MANDATORY) {
      return false;
    }
    return true;
  }


  private updateValidationRules() {
    let nameValidators = [Validators.minLength(2), Validators.maxLength(200),
      Validators.required, CustomValidators.noWhitespaceValidator];
    if (this.nameFieldOptional()) {
      nameValidators = [Validators.maxLength(200)];
    }
    let emailValidators = [CustomValidators.email, Validators.minLength(2),
      Validators.maxLength(200), Validators.required, CustomValidators.noWhitespaceValidator];
    if (this.emailFieldOptional()) {
      emailValidators = [CustomValidators.email, Validators.maxLength(200)];
    }

    this.personalInfoForm = this.fb.group({
      name: [this.checkoutService.getOrderMetaData('customerName'), {validators: nameValidators, updateOn: 'change'}],
      email: [this.checkoutService.getOrderMetaData('customerEmail'), {validators: emailValidators, updateOn: 'change'}],
      phone: [this.checkoutService.getOrderMetaData('customerPhoneNumber'), {updateOn: 'change'}],
    });

    this.personalInfoForm.updateValueAndValidity();
    this.checkFormValidity();
    this.getControl('name').markAsDirty();
    this.getControl('email').markAsDirty();
    this.getControl('phone').markAsDirty();

  }

  updateOrderMetaDataValues() {
    this.updateValues('name', 'customerName');
    this.updateValues('email', 'customerEmail');
    this.updateValues('phone', 'customerPhoneNumber');
    this.checkFormValidity();
  }

  updateValues(control: string, meta: string) {
    if(this.getControl(control).value !== this.checkoutService.getOrderMetaData(meta)){
      this.getControl(control).patchValue(this.checkoutService.getOrderMetaData(meta))
    }
  }

  logout() {
    this.customerAuthService.logout();
    this.formChanged = false;
    this.isSociallyLoggedIn = false;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  countryCode(){
    return this.selectedStore?.address?.country?.phoneCode
  }
}
