import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid, LocationType } from 'src/app/stores/stores';
import { Cart, OrderMetaState } from '../../+state/stores.reducer';
import { select, Store } from '@ngrx/store';
import { HelperService } from 'src/app/public/helper.service';
import {
  getStoreLocationsState,
  getCurrentOrderMetaState,
  getCurrentCartStatus,
  getCheckoutState
} from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { ValidateStoreLocations, AddCheckoutState, ValidateStoreLocationsSuccess } from '../../+state/stores.actions';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';
import { CustomValidators } from '../../../../shared/custom.validators';
import { LocationService } from 'src/app/public/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreLocationService } from 'src/app/stores/store-location/store-location.service';
import { CookieService } from 'ngx-cookie-service';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-store-checkout-delivery-at-location',
  templateUrl: './store-checkout-delivery-at-location.component.html',
  styleUrls: ['./store-checkout-delivery-at-location.component.scss']
})
export class StoreCheckoutDeliveryAtLocationComponent implements OnInit, OnDestroy {

  checkoutOptionsForm: FormGroup;
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  orderUuid: string;
  selectedPickupMethod: number;
  addToCartDisabled: boolean;
  addedToCart: boolean;
  storeLocation: string | number;
  validationTimer = null;
  validLocations: LocationValid = null;
  locationPersistedInMemory =  false;
  PICKUP_METHOD = PICKUP_METHOD;
  storeId: number;
  isStoreVisitor = false;
  locationResponse = true;
  isPinValid = false;
  isTapIdExpired = true;
  isTapIdMismatch = false;
  isValidatingPin = false;

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    private helper: HelperService,
    public checkoutService: CheckoutService,
    public location: LocationService,
    private router: Router,
    private storeLocationService: StoreLocationService,
    private cookieService: CookieService,
    ) {}

  ngOnInit() {
    this.loadData();
  } // EOF: ngOnInit

  loadData() {
    // disable order button
    this.invalidateSubmit(true);
    this.storeId = this.checkoutService.selectedStore.id;
    this.selectedStore = this.checkoutService.selectedStore;
    if (this.cookieService.get(this.storeId + '_' + this.getLocationId() + '_' + 'ONE_TAP')) {
      this.isTapIdExpired = false;
      const tapId = JSON.parse(this.cookieService.get(this.storeId + '_' + this.getLocationId() + '_' + 'ONE_TAP'));
      this.checkoutService.setOrderMetaState('tapId', tapId);
      this.invalidateSubmit(false);
    }

    this.store.select(getCheckoutState)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(state => {
      const errors = state?.checkoutState?.data?.orderSubmitError?.errors;
      if (errors && errors.length > 0) {
        errors.forEach(error => {
          if (error.code === 'TAP_ID_MISMATCH'){
            if (this.cookieService.get(this.storeId + '_'  + this.getLocationId() + '_' + 'ONE_TAP')) {
              this.isTapIdExpired = true;
              this.cookieService.delete(this.storeId + '_'  + this.getLocationId() + '_' + 'ONE_TAP');
              this.invalidateSubmit(true);
            }
            this.isTapIdMismatch = true;
          }
        });
      }
    });

    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      if (!(s && s.storeRoles && this.storeId && (s.superAdmin || s.affiliate)
        || (this.storeId && (s.storeRoles[+this.storeId] === 'STORE_ADMIN' || s.storeRoles[+this.storeId] === 'STORE_STANDARD')))) {
        this.isStoreVisitor = true;
      }
    });

    this.store.pipe(
      select(getCurrentOrderMetaState),
      takeUntil(this.unsubscribe$)
    ).subscribe(state => {
      const location = state?.data?.location;
      const tableControl = this.getControl('table', 'checkoutOptionsForm');
      if (location && tableControl && location !== tableControl.value) {
        tableControl.patchValue(state.data.location, {onlySelf: true, emitEvent: false});
      }
    });

    this.store.pipe(
      select(getStoreLocationsState),
      takeUntil(this.unsubscribe$)
    ).subscribe(state => {
      if (!state?.isValid && this.getControl('table')?.value){
        this.getControl('table').setErrors({invalidLocation: true});
      }

      this.updateLocationValidation();

      if (state?.isValid && this.requirePin()){
        this.validatePin();
      }
    });

    combineLatest([this.store.select(getCurrentCartStatus)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state[0]) {
          case 'ORDERUPDATING':
            // this.invalidateSubmit(true);
            break;
          case 'LOADED':
            this.updatePickupValidationRules();
            break;
        }
      });

    // uninvalidate submit and validate location
    if (this.checkoutService.validCartLocation()) {
      this.invalidateSubmit(false);
      this.selectedPickupMethod = PICKUP_METHOD.AT_LOCATION;
      this.storeLocation = this.checkoutService.cartData.location;
      this.checkoutService.setCheckoutState('storeLocation', this.storeLocation.toString());
      if (this.checkoutService.validateCartLocation()) {
        this.store.dispatch(new ValidateStoreLocations( this.checkoutService.selectedStore.id, this.checkoutService.storeLocation));
      }
    }

    // set validation pickup rules:
    let slocation: string | number = '';

    if (this.checkoutService.selectedPickupMethod === PICKUP_METHOD.AT_LOCATION
        && (this.checkoutService.getValidLocations() || this.checkoutService.storeLocation))  {
      slocation = this.storeLocation;
      if (!location && this.checkoutService.getValidLocations()) {
        slocation = this.checkoutService.getValidLocations().label;
      }
    }

    this.checkoutOptionsForm = this.fb.group({
      table: [slocation, Validators.compose([Validators.required, Validators.maxLength(10)])],
      pinnumber: [slocation, Validators.compose([Validators.required,
      Validators.maxLength(4), Validators.pattern('^[0-9]*$')])],
    }, {
      validator: [CustomValidators.checkForOnlySpaces('table')]
    });

    this.getControl('table').markAsDirty();
    this.getControl('pinnumber').markAsDirty();

  }

  updatePickupValidationRules() {
    // set checkout options form validator rules
    let location: string | number = '';

    if (
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION &&
      (
        this.checkoutService.getValidLocations() ||
        this.location.getUrlStoreLocation()
      )
    ) {
      location = this.location.getUrlStoreLocation();
      if (!location && this.checkoutService.getValidLocations()) {
        location = this.checkoutService.getValidLocations().label;
      }
    }
    if (this.checkoutService.getPickupMethodAsInt() > PICKUP_METHOD.AT_LOCATION) {
      this.invalidateSubmit(false);
    }

    if (this.getControl('table')) {
      if (
        this.checkoutService.getLocationInitiallyPersisted() ||
        (
          !this.checkoutService.getLocationInitiallyPersisted() &&
          this.checkoutService.isValidLocation()
        )
      ) {
        this.getControl('table').setValue((location ? location + '' : '').toString());
        this.getControl('table').markAsTouched();
        this.getControl('table').setErrors(null);
        this.getControl('table').setValidators([Validators.required, Validators.maxLength(10)]);
        this.getControl('table').updateValueAndValidity();
        this.invalidateSubmit(false);
      } else {
        this.getControl('table').markAsTouched();
        this.getControl('table').setValidators([Validators.required, Validators.maxLength(10)]);
        this.getControl('table').setErrors({invalidLocation: true });
      }
    }
  }

  validateLocation(field: string, formData: string = 'checkoutOptionsForm') {
    if (this.getControl(field, formData).value !== '' && this.helper.checkLocationInputValidity(this.getControl(field, formData).value)) {
          this.store.dispatch(new ValidateStoreLocations(
            this.checkoutService.selectedStore.id,
            this.getControl(field, formData).value.toUpperCase()
          ));
    } else {
      this.store.dispatch(new ValidateStoreLocationsSuccess({ isValid: false} ));
    }
    this.updateLocationValidation();
  }

  updateLocationValidation() {
    this.isTapIdExpired = true;
    if (this.checkoutService.validLocations) {
      if (this.cookieService.get(this.storeId + '_'  + this.getLocationId() + '_' + 'ONE_TAP')) {
        this.isTapIdExpired = false;
        const tapId = JSON.parse(this.cookieService.get(this.storeId + '_'  + this.getLocationId() + '_' + 'ONE_TAP'));
        this.checkoutService.setOrderMetaState('tapId', tapId);
        this.invalidateSubmit(false);
      }
    }
  }

  checkValidateLocation() {
    this.invalidateSubmit(true);
    this.checkoutService.setCheckoutState('locationInitiallyPersisted', false);

    if (this.getControl('table')?.value) {
      this.getControl('table').setValue(this.getControl('table').value.toUpperCase());
      this.getControl('table').markAsTouched();

      if (this.helper.checkLocationInputValidity(this.getControl('table').value, 1, 10)) {
        this.getControl('table').setErrors(null);
      } else {
        this.getControl('table').setErrors({invalidLocation: true });
      }
    }

    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
      this.validationTimer = null;
    }
    this.validationTimer = setTimeout(() => {
      this.validateLocation('table', 'checkoutOptionsForm');
    }, 300);
  }

  invalidateSubmit(orderBtnDisabled: boolean) {
    if (
      !orderBtnDisabled &&
      (this.checkoutService.getPickupMethodAsInt() > PICKUP_METHOD.AT_LOCATION ||
        (this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION &&
          (!this.checkoutOptionsForm || !!(this.checkoutOptionsForm && this.checkoutOptionsForm.valid)
          )
        )
      ) && this.isPinValid
    ) {
      this.updateFormValidation(true);
    } else if (this.isTapIdExpired && this.isStoreVisitor && !this.isPinValid && this.isStoreOpen()
               && this.checkoutService.orderMetaData.data.deliveryMethod === '0') { // deliveryMethod = 0 = TABLE
      this.updateFormValidation(false);
      this.getControl('pinnumber', 'checkoutOptionsForm')?.setErrors({ invalidPin: true });
    } else {
      this.updateFormValidation(true);
    }
  }


  updateFormValidation(value: boolean) {
    this.store.dispatch(new AddCheckoutState('checkoutOptionsFormValid', value, {
      src: 'CheckoutDeliveryAtLocationComponent',
      description: 'Update form validation'
    }));
  }

  getControl(name: string, form: string = 'checkoutOptionsForm'): AbstractControl {
    if (this[form]) {
      return this[form].get(name) as AbstractControl;
    }
    return null;
  }

  clearLocation() {
    this.location.clearStoreLocationUrl();
    this.router.navigateByUrl(this.location.base_url(`cart`));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public get LocationType(): typeof LocationType {
    return LocationType;
  }

  requirePin(){
    return (this.checkoutService.showReadOnlyLocation() || this.checkoutService.showEditableLocation())
      && this.isStoreOpen()
      && !(this.getControl('table') && this.getControl('table')?.errors && this.getControl('table')?.errors.invalidLocation)
      && this.getControl('table')?.value.length > 0
      && this.isTapIdExpired
      && this.isStoreVisitor
      || this.isTapIdMismatch;
  }

  validatePin() {
    this.isValidatingPin = true;
    this.invalidateSubmit(true);
    this.isPinValid = false;
    const pinValue = this.getControl('pinnumber', 'checkoutOptionsForm').value;
    const isNumericPin = /^[0-9]+$/.test(pinValue.toString());
    if (pinValue.toString().length === 4 && isNumericPin) {
      this.storeLocationService.validPin(this.storeId, this.getLocationId(), pinValue).
        subscribe(res => {
          this.isPinValid = res.isPinValid;
          if (res.isPinValid) {
            this.invalidateSubmit(false);
            const cookieName = this.storeId + '_' + this.getLocationId() + '_' + 'ONE_TAP';
            this.cookieService.set(cookieName, res.tapId.toString(), 1); // storing tapId for 24 hours/a day.
            this.checkoutService.setOrderMetaState('tapId', res.tapId.toString());
            this.getControl('pinnumber', 'checkoutOptionsForm').setErrors(null);
          } else {
            this.getControl('pinnumber', 'checkoutOptionsForm').setErrors({ invalidPin: true });
          }
          this.isValidatingPin = false;
        });
      } else {
        this.getControl('pinnumber', 'checkoutOptionsForm').setErrors({ invalidPin: true });
        this.invalidateSubmit(true);
        this.isValidatingPin = false;
    }
  }

  private isStoreOpen(): boolean {
    if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
      return this.checkoutService.validLocations.status === 'OPEN';
    }
  }

  private getLocationId(): number {
    if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
      return this.checkoutService.validLocations.id;
    }
  }

  getStoreLocationType(): string {
    if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
      return this.checkoutService.getValidLocations().locationType;
    }
  }

  getLocationDescription(): string {
    if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
      return this.checkoutService.getValidLocations().description;
    }
  }

  getLocationLabel(): string {
    if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
      return this.checkoutService.getValidLocations().label;
    }
  }

  showPinErrors() {
    const pinControl = this.getControl('pinnumber');

    if((pinControl?.value?.length < 4 && !this.checkoutService.invalidSubmit() || this.isValidatingPin)){
      return false
    }
    
    return pinControl?.invalid ;
  }

}
