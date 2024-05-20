import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { CustomerAuthService } from 'src/app/public/customer-auth.service';
import { HelperService } from 'src/app/public/helper.service';
import { LocationService } from 'src/app/public/location.service';
import { OrderingSetting } from 'src/app/stores/+state/stores.reducer';
import { ClientStore } from 'src/app/stores/stores';
import {
  AddCheckoutState,
  AddOrderMeta,
  CustomerDetailsUpdate,
  GeocodeAddress,
  GeocodeAddressSuccess,
  GetAssociatedZone,
  UpdateZipCode
} from '../../+state/stores.actions';
import { Cart, CustomerDetailsUpdateState, OrderMetaState, SocialLoginState, ZoneData } from '../../+state/stores.reducer';
import {
  getCartState,
  getCheckoutState,
  getCurrentCartUuid,
  getCurrentOrderDeliveryMethod,
  getCurrentOrderMetaState,
  getCustomerDetailsUpdate,
  getCustomerInfo,
  getSelectedStore,
  getSocialAuth,
  getTokens,
  getZoneState
} from '../../+state/stores.selectors';
import { CustomValidators } from '../../../../shared/custom.validators';
import { CustomerDetailsUpdateRequest } from '../../types/CustomerSocialLogin';
import { DELIVERY_METHOD_VALUES } from '../../types/DeliveryMethod';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';

@Component({
  selector: 'app-store-checkout-delivery-to-address',
  templateUrl: './store-checkout-delivery-to-address.component.html',
  styleUrls: ['./store-checkout-delivery-to-address.component.scss'],
})
export class StoreCheckoutDeliveryToAddressComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  PICKUP_METHOD = PICKUP_METHOD;
  autocomplete: any;
  customerDetailsUpdateStatus = 'INITIAL';
  socialLoginState: SocialLoginState;
  customerDetailsUpdateState: CustomerDetailsUpdateState;
  zonedata: ZoneData;
  isAdminOrderCaptureUpdate = true;
  @ViewChild('street') addresstextElement: ElementRef;

  // Google Maps API changes autocomplete value to 'off' after the address is selected
  // Chrome has a bug where it doesn't respect autocomplete='off' on the input element
  // This observer will set the autocomplete attribute to 'none' if the address is filled
  private autocompleteAttrObserver = new MutationObserver(() => {
    this.autocompleteAttrObserver.disconnect();
    this.addresstextElement.nativeElement.setAttribute('autocomplete', this.getControl('street').value ? 'none' : 'street-address');
  });

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    public checkoutService: CheckoutService,
    public helper: HelperService,
    public auth: CustomerAuthService,
    private ref: ChangeDetectorRef,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();
    this.store
      .select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d) {
          this.selectedStore = d;
        }
      });

    // get checkout state
    this.store
      .select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d.checkoutState) {
          this.checkoutStateData = d.checkoutState.data;
        }
      });

    this.store
      .select(getCurrentOrderMetaState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d) {
          this.orderMetaData = d;
          if (d.data && d.data.deliveryMethod && d.data.deliveryMethod != DELIVERY_METHOD_VALUES.ADDRESS) {
            this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES.ADDRESS, {
              src: 'StoreCheckoutDeliveryToAddressComponent',
              description: 'Delivery method changed to address'
            }));
          }
        }
      });

    // get zone state
    this.store
      .select(getZoneState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        this.zonedata = d;
        this.checkFormValidity();
      });

    this.store
      .select(getSocialAuth)
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((state) => state?.socialLoginState?.socialAuthStatus === 'SUCCESS')
      )
      .subscribe((state) => {
        this.socialLoginState = state.socialLoginState;
        this.setCustomerDetails(state.socialLoginState);
        this.customerDetailsUpdateStatus = 'INITIAL';
      });

    this.store
      .select(getCustomerDetailsUpdate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        const customerDetailsUpdateResponse = state.customerDetailsUpdateState;
        if (customerDetailsUpdateResponse) {
          this.customerDetailsUpdateStatus = customerDetailsUpdateResponse.customerDetailsUpdateStatus;
          if (this.customerDetailsUpdateStatus === 'SUCCESS') {
            this.customerDetailsUpdateState = customerDetailsUpdateResponse;
          }
        }
      });

    this.store
      .select(getCurrentOrderMetaState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d) {
          this.updateOrderMetaDataValues();
        }
      });

    this.store
      .select(getCurrentOrderDeliveryMethod)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => this.updateValidationRules());

    if (this.isAdminOrderCaptureUpdate) {
      this.store
        .select(getCustomerInfo)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((state) => {
          if (state) {
            const { name, email, phone } = state;
            if (email) {
              if (this.getControl('email')) {
                this.getControl('email').patchValue(email, { emitEvent: true });
                this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
              }
            }

            if (phone) {
              if (this.getControl('phone')) {
                this.getControl('phone').patchValue(phone, { emitEvent: true });
                this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
              }
            }
          }
        });
    }
    combineLatest([
      this.store.select(getZoneState),
      this.store.select(getCartState),
      this.store.select(getCurrentCartUuid),
      this.store.select(getSelectedStore),
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(
          ([zoneState, cartState, cartUuid]) =>
            zoneState?.zoneState?.status === 'INITIAL' && cartState?.cartState?.status === 'LOADED' && cartUuid !== null
        )
      )
      .subscribe(([zoneState, cartState, cartUuid, selectedStore]) => {
        if (this.checkoutService.getZoneRestrictions() && this.orderMetaData?.data?.customerZip) {
          this.store.dispatch(
            new GetAssociatedZone(selectedStore.id, cartUuid, this.orderMetaData?.data?.customerZip, {
              src: 'StoreCheckoutDeliveryToAddressComponent',
              description: 'Get Associated Zone',
            })
          );
        }
      });
  } // EOF: ngOnInit

  isShowReadOnlyLocation() {
    if (
      this.checkoutService.ifOnlyInStore() ||
      this.checkoutService.showReadOnlyLocation() ||
      this.checkoutService.showEditableLocation() ||
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION
    ) {
      return true;
    }
    return false;
  }

  isShowOnlySelfPickup() {
    if (
      this.checkoutService.ifOnlySelfPickup() ||
      (this.checkoutService.ifEnabledSelfPickup() && this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.MY_SELF)
    ) {
      return true;
    }
    return false;
  }

  isShowOnlyDeliveryToAddress() {
    if (
      this.checkoutService.ifOnlyDeliveryToAddress() ||
      (this.checkoutService.ifEnabledDeliveryAtAddress() && this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS)
    ) {
      return true;
    }
    return false;
  }

  setCustomerDetails(response) {
    if (response.email && this.getControl('email')) {
      this.getControl('email').patchValue(response.email, { emitEvent: true });
      this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
    }
    if (response.phoneNumber && this.getControl('phone')) {
      this.getControl('phone').patchValue(response.phoneNumber, { emitEvent: true });
      this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
    }
    if (response.floorNumber && this.getControl('floor') && !this.getControl('floor').value) {
      this.getControl('floor').patchValue(response.floorNumber, { emitEvent: true });
      this.addOrderMeta('customerFloor', 'floor', 'personalInfoForm');
    }
    if (response.streetAddress && this.getControl('street') && !this.getControl('street').value) {
      this.getControl('street').patchValue(response.streetAddress, { emitEvent: true });
      this.addOrderMeta('customerStreet', 'street', 'personalInfoForm');
    }
    if (response.city && this.getControl('town') && !this.getControl('town').value) {
      this.getControl('town').patchValue(response.city, { emitEvent: true });
      this.addOrderMeta('customerTown', 'town', 'personalInfoForm');
    }
    if (response.postCode && this.getControl('zip') && !this.getControl('zip').value) {
      this.getControl('zip').patchValue(response.postCode, { emitEvent: true });
      this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
      this.checkZoneData();
    }
    this.checkFormValidity();
  }

  updateOrderMetaDataValues() {
    this.updateValues('name', 'customerName');
    this.updateValues('email', 'customerEmail');
    this.updateValues('phone', 'customerPhoneNumber');
    this.updateValues('floor', 'customerFloor');
    this.updateValues('street', 'customerStreet');
    this.updateValues('town', 'customerTown');
    this.checkFormValidity('Update order meta data values');
  }

  updateValues(control: string, meta: string) {
    if (this.getControl(control)?.value !== this.checkoutService.getOrderMetaData(meta)) {
      this.getControl(control)?.patchValue(this.checkoutService.getOrderMetaData(meta));
    }
  }

  initiateGoogleApi() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    if (!this.addresstextElement || !this.deliveryAddressAutocomplete() || this.autocomplete) {
      return;
    }

    // Observe autocomplete attribute changes made by Google Maps API
    this.autocompleteAttrObserver.observe(this.addresstextElement.nativeElement, {
      attributes: true,
      attributeFilter: ['autocomplete'],
    });

    this.autocomplete = new google.maps.places.Autocomplete(this.addresstextElement.nativeElement, {
      componentRestrictions: { country: this.selectedStore.address.country.code },
      types: ['address'], // 'establishment' / 'address' / 'geocode'
    });
    google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
      const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
      if (place?.geometry) {
        this.invokeEvent(place);
      }
    });
  }

  deliveryAddressAutocomplete() {
    if (this.selectedStore.settings.DELIVERY_ADDRESS_AUTOCOMPLETE) {
      return true;
    }
    return false;
  }

  deliveryFloorRequired() {
    if (this.selectedStore.settings.FLOOR_NUMBER_VISIBILITY) {
      return true;
    }
    return false;
  }

  invokeEvent(place: google.maps.places.PlaceResult) {
    const streetNumber = this.getStreetNumber(place) ? `, ${this.getStreetNumber(place)}` : '';
    const street = this.getStreet(place);
    if (street) {
      this.getControl('street').patchValue(`${this.getStreet(place)}${streetNumber}`, { emitEvent: true });
      this.store.dispatch(
        new AddOrderMeta('customerStreet', `${this.getStreet(place)}${streetNumber}`, {
          src: 'StoreCheckoutDeliveryToAddressComponent',
          description: 'Google Maps Address selected, Street value changed',
        })
      );
    }
    this.getControl('town').patchValue(this.getCity(place), { emitEvent: true });
    this.store.dispatch(
      new AddOrderMeta('customerTown', this.getCity(place), {
        src: 'StoreCheckoutDeliveryToAddressComponent',
        description: 'Google Maps Address selected, Town value changed',
      })
    );
    const zip = this.getPostCode(place);
    if (zip || zip === '') {
      this.getControl('zip').patchValue(zip, { emitEvent: true });
      this.store.dispatch(
        new AddOrderMeta('customerZip', zip, {
          src: 'StoreCheckoutDeliveryToAddressComponent',
          description: 'Google Maps Address selected, Zip value changed',
        })
      );
      this.store.dispatch(
        new AddCheckoutState('personalFormValid', false, {
          src: 'StoreCheckoutDeliveryToAddressComponent',
          description: 'Google Maps Address selected, Zip value changed',
        })
      );
    }
    const coordinates: google.maps.LatLng = place.geometry.location;
    this.store.dispatch(
      new GeocodeAddressSuccess(coordinates.lat(), coordinates.lng(), {
        src: 'StoreCheckoutDeliveryToAddressComponent',
        description: 'Google Maps Address selected',
      })
    );
    this.ref.detectChanges();
    this.checkFormValidity();
  }

  getAddrComponent(place, componentTemplate) {
    let result;
    if (!place || !place.address_components) {
      return '';
    }

    for (const addressComponent of place.address_components) {
      const addressType = addressComponent.types[0];
      const addressTypeAlt = addressComponent.types[1];
      if (componentTemplate[addressType]) {
        result = addressComponent[componentTemplate[addressType]];
        return result;
      }
      if (addressTypeAlt && componentTemplate[addressTypeAlt]) {
        result = addressComponent[componentTemplate[addressTypeAlt]];
        return result;
      }
    }
    return;
  }

  getStreetNumber(place) {
    const COMPONENT_TEMPLATE = { street_number: 'short_name' };
    const streetNumber = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return streetNumber;
  }

  getStreet(place) {
    const COMPONENT_TEMPLATE = { route: 'long_name' };
    const street = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return street;
  }

  getCity(place) {
    const COMPONENT_TEMPLATE = { locality: 'long_name', postal_town: 'long_name' };
    const city = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return city;
  }

  getPostCode(place) {
    const COMPONENT_TEMPLATE = { postal_code: 'long_name' };
    const postCode = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return postCode ? postCode : '';
  }

  updateValidationRules() {
    let floorValidators = [Validators.maxLength(50)];
    if (this.deliveryFloorRequired()) {
      floorValidators = [Validators.maxLength(50), Validators.required, CustomValidators.noWhitespaceValidator];
    }
    let emailValidators;
    if (this.locationService.isAdminOrderCaptureUpdate()) {
      emailValidators = [CustomValidators.email, Validators.maxLength(200)];
    } else {
      emailValidators = [Validators.required, CustomValidators.email, Validators.maxLength(200)];
    }
    this.personalInfoForm = this.fb.group({
      name: [
        this.checkoutService.getOrderMetaData('customerName'),
        {
          validators: [Validators.minLength(2), Validators.maxLength(200), Validators.required, CustomValidators.noWhitespaceValidator],
          updateOn: 'change',
        },
      ],
      street: [
        this.checkoutService.getOrderMetaData('customerStreet'),
        { validators: [Validators.maxLength(200), Validators.required, CustomValidators.noWhitespaceValidator], updateOn: 'change' },
      ],
      zip: [
        this.checkoutService.getOrderMetaData('customerZip'),
        { validators: [Validators.maxLength(16), Validators.required, CustomValidators.noWhitespaceValidator], updateOn: 'change' },
      ],
      town: [
        this.checkoutService.getOrderMetaData('customerTown'),
        { validators: [Validators.maxLength(64), Validators.required, CustomValidators.noWhitespaceValidator], updateOn: 'change' },
      ],
      email: [this.checkoutService.getOrderMetaData('customerEmail'), { validators: emailValidators, updateOn: 'change' }],
      phone: [this.checkoutService.getOrderMetaData('customerPhoneNumber'), { updateOn: 'change' }],
      floor: [this.checkoutService.getOrderMetaData('customerFloor'), { validators: floorValidators, updateOn: 'change' }],
    });
    this.checkZoneData();
    this.personalInfoForm.updateValueAndValidity();
    this.checkFormValidity();
    this.markAsDirty(this.personalInfoForm);

    this.store.dispatch(
      new UpdateZipCode(this.getControl('zip').value, {
        src: 'StoreCheckoutDeliveryToAddressComponent',
        description: 'Zip value changed',
      })
    );

    this.checkGeolocation();

    this.getControl('zip')
      .valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((newValue) => {
        this.addOrderMeta('customerZip', 'zip', 'personalInfoForm');
        this.store.dispatch(
          new UpdateZipCode(newValue, {
            src: 'StoreCheckoutDeliveryToAddressComponent',
            description: 'Zip value changed',
          })
        );
        this.checkGeolocation();
      });

    this.personalInfoForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.checkFormValidity();
    });
  }

  private checkGeolocation() {
    if (this.checkoutService.isGeolocationRequired()) {
      const street = this.getControl('street').value;
      const city = this.getControl('town').value;
      const zipCode = this.getControl('zip').value;

      if (street && city && zipCode) {
        this.store.dispatch(
          new GeocodeAddress(`${street} ${city}`, zipCode, this.selectedStore.address.country.code, {
            src: 'StoreCheckoutDeliveryToAddressComponent',
            description: 'Zip value changed',
          })
        );
      }
    }
  }

  private markAsDirty(form: FormGroup) {
    if (form) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
    }
  }

  getControl(name: string, form: string = 'personalInfoForm'): AbstractControl {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  checkFormValidity(description = 'Form value changed') {
    this.personalInfoForm &&
      this.store.dispatch(
        new AddCheckoutState('personalFormValid', this.personalInfoForm.valid, {
          src: 'StoreCheckoutDeliveryToAddressComponent',
          description,
        })
      );
  }

  // NOTE: since I will disable the button through setting personalFormValid validity
  //            this check should most probably be done on checkFormValidity (all fields)
  checkZipAndFormValidity(fetchZone = false) {
    if (this.checkoutService.getZoneRestrictions()) {
      this.store.dispatch(
        new AddCheckoutState('personalFormValid', false, {
          src: 'StoreCheckoutDeliveryToAddressComponent',
          description: 'Zip value changed',
        })
      );
    }
    this.checkFormValidity();
  }

  addOrderMeta(metaKey, control, formGroup = 'personalInfoForm') {
    this.store.dispatch(
      new AddOrderMeta(metaKey, this.getControl(control, formGroup).value, {
        src: 'StoreCheckoutDeliveryToAddressComponent',
        description: `${metaKey} value changed`,
      })
    );
  }

  /**
   * Check if name field should be hidden
   * Currently it only considers when table ordering
   */
  nameFieldHidden() {
    return false;
  }

  /**
   * Check if email field should be hidden
   * Currently it only considers when table ordering
   */
  emailFieldHidden() {
    return false;
  }

  /**
   * Check if phone field should be hidden
   * Currently it only considers when table ordering
   */
  phoneFieldHidden() {
    if (
      this.checkoutService.ifOnlyInStore() ||
      this.checkoutService.showReadOnlyLocation() ||
      this.checkoutService.showEditableLocation() ||
      this.checkoutService.getPickupMethodAsInt() === 0
    ) {
      return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_SELECTION_TEL === OrderingSetting.HIDDEN;
    }
    return false;
  }

  nameFieldOptional() {
    return true;
  }

  emailFieldOptional() {
    return this.isAdminOrderCaptureUpdate;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  customerDetailsChanged(): boolean {
    const state = this.customerDetailsUpdateState ?? this.socialLoginState;

    if (!state) {
      return false;
    }

    const fields = ['name', 'phone', 'floor', 'street', 'town', 'zip'];
    const stateFields = ['userName', 'phoneNumber', 'floorNumber', 'streetAddress', 'city', 'postCode'];

    const changed = fields.some((field, index) => state[stateFields[index]] && this.getControl(field)?.value !== state[stateFields[index]]);

    if (changed) {
      this.customerDetailsUpdateStatus = 'INITIAL';
    }

    return changed;
  }

  updateCustomerDetails() {
    this.store
      .select(getTokens)
      .pipe(take(1))
      .subscribe((tokens) => {
        const tokenPair = !!tokens.jwt ? tokens : null;
        const customerDetails: CustomerDetailsUpdateRequest = {
          tokens: tokenPair,
          userName: this.getControl('name')?.value,
          phoneNumber: this.getControl('phone')?.value,
          floorNumber: this.getControl('floor')?.value,
          streetAddress: this.getControl('street')?.value,
          city: this.getControl('town')?.value,
          postCode: this.getControl('zip')?.value,
        };
        this.store.dispatch(new CustomerDetailsUpdate(customerDetails));
      });
  }

  ngOnDestroy() {
    if (this.autocomplete && this.addresstextElement) {
      google.maps.event.clearInstanceListeners(this.addresstextElement.nativeElement);
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFocusOutEvent() {
    this.checkGeolocation();
  }

  checkZoneData() {
    if (
      this.checkoutService.getZoneRestrictions() &&
      this.orderMetaData &&
      this.orderMetaData.data &&
      this.orderMetaData.data.customerZip &&
      this.zonedata &&
      this.zonedata.zoneState &&
      this.zonedata.zoneState.status === 'INITIAL'
    ) {
      this.store
        .select(getCurrentCartUuid)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((orderUuid) => {
          if (!!orderUuid) {
            this.store.dispatch(
              new UpdateZipCode(this.orderMetaData.data.customerZip, {
                src: 'StoreCheckoutDeliveryToAddressComponent',
                description: 'Check Zone Data | Order uuid changed',
              })
            );
          }
        });
    }
  }

  countryCode() {
    return this.selectedStore?.address?.country?.phoneCode;
  }
}
