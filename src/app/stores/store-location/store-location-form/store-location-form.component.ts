import { ClientStoreLocationRequest } from './../store-location';
import {
  Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef,
  AfterContentInit
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { getSelectedStore, getStoresList } from 'src/app/stores/+state/stores.selectors';
import { ClientStore, ClientStoreRequest } from 'src/app/stores/stores';
import { WindowRefService } from 'src/app/window.service';
import { helpPage } from 'src/app/shared/help-page.const';
import moment from 'moment';
import { getSelectedStoreLocation } from '../+state/store-location.selectors';
import { Country } from 'src/app/api/types/Country';
import { Language } from 'src/app/api/types/Language';
import { enableStandalonePaymentSetting, resrvationAllowCustomerSetting, standalonePaymentSourceSetting } from '../../+state/stores.reducer';
import { DownloadLocationPinPdf } from '../+state/store-location.actions';
import { parseAddress } from 'src/app/shared/map-address.helper';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { WhitelabelService } from '../../../shared/whitelabel.service';

@Component({
  selector: 'app-store-location-form',
  templateUrl: './store-location-form.component.html',
  styleUrls: ['./store-location-form.component.scss']
})
export class StoreLocationFormComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {

  @Input() location: ClientStoreLocationRequest;
  @Input() storeData: ClientStoreRequest;
  @Input() mode: 'CREATE' | 'UPDATE';
  @Output() save = new EventEmitter<ClientStoreLocationRequest>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @ViewChild('mapWrapper') mapElement: ElementRef;
  @ViewChild('addresstext') addresstext: any;
  map: google.maps.Map;
  stores$: Observable<any>;
  stores: any;
  tagVisible$: Observable<boolean>;
  customerResrvationEnabled: boolean;

  locationForm: FormGroup;
  locationUrl = '';
  storeUrl = '';
  currentLocation = '';
  storeAlias = '';
  storeOpenTap: boolean;
  showAdditionalPart: boolean;
  mapReturnResult: boolean;
  private protocol: string;
  enableStandalonePayment: enableStandalonePaymentSetting;
  standalonePaymentSource: standalonePaymentSourceSetting;
  private host: string;
  private destroy$ = new Subject<void>();
  isStoreOperator = false;
  storeId: number;
  qrCodesLocationHelpPage = helpPage.locations;
  storeId$: Observable<number>;
  // store$: Observable<ClientStoreRequest>;
  locationId: any;
  locationLabel: any;
  // storeData: ClientStoreRequest;
  addressImageURL: string;
  countriesList: Country[] = [];
  languagesList: Language[] = [];
  code: string;
  setAddress: string;
  componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };
  countryCode: string;

  // Google Maps API changes autocomplete value to 'off' after the address is selected
  // Chrome has a bug where it doesn't respect autocomplete='off' on the input element
  // This observer will set the autocomplete attribute to 'none' if the address is filled
  private autocompleteAttrObserver = new MutationObserver(() => {
    this.autocompleteAttrObserver.disconnect();
    this.addresstext.nativeElement.setAttribute('autocomplete', this.getControl('addressLine1').value ? 'none' : 'address-line1');
  });

  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private windowService: WindowRefService,
    private changeDetector: ChangeDetectorRef,
    private whitelabelService: WhitelabelService
  ) {
    this.protocol = windowService.nativeWindowLocation.protocol;
    this.host = whitelabelService.getHost();
  }

  ngOnInit() {
    this.stores$ = this.store.pipe(
      select(getStoresList),
      takeUntil(this.destroy$)
    );

    this.stores$.subscribe((stores) => {
      this.stores = stores;
    });

    if (this.location.locationType === 'LOCATION' || this.location.locationType === 'ROOM') {
      this.showAdditionalPart = true;
    } else {
      this.showAdditionalPart = false;
    }
    this.locationForm = this.fb.group({
      label: [this.location.label, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')])],
      description: [this.location.description],
      comment: [this.location.comment],
      locationType: [this.location.locationType],
      openTap: [this.location.openTap],
      externalId: [this.location.externalId],
      status: [this.location.status === 'OPEN'],
      maxCapacity: [this.location.maxCapacity],
      minCapacity: [this.location.minCapacity],
      allowCustomerReservation: [this.location.allowCustomerReservation],
      reservationPriority: [this.location.reservationPriority],
      addressLine1: [
        this.mode === 'UPDATE' && this.location.addressLine1 ? this.location.addressLine1 :
          this.mode === 'CREATE' && this.storeData.addressLine1 ? this.storeData.addressLine1 : '',
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(128), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ])
      ],
      addressLine2: [
        this.mode === 'UPDATE' && this.location.addressLine2 ? this.location.addressLine2 :
          this.mode === 'CREATE' && this.storeData.addressLine2 ? this.storeData.addressLine2 : '',
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(128), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ])
      ],
      postCode: [
        this.mode === 'UPDATE' && this.location.postCode ? this.location.postCode :
          this.mode === 'CREATE' && this.storeData.postCode ? this.storeData.postCode : '',
        Validators.compose([Validators.minLength(1), Validators.maxLength(16)])],
      region: [
        this.mode === 'UPDATE' && this.location.region ? this.location.region :
          this.mode === 'CREATE' && this.storeData.region ? this.storeData.region : '',
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(64), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ])
      ],
      city: [
        this.mode === 'UPDATE' && this.location.city ? this.location.city :
          this.mode === 'CREATE' && this.storeData.city ? this.storeData.city : '',
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(64), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ])
      ],
      email: [this.mode === 'UPDATE' && this.location.email ? this.location.email : '', [CustomValidators.email, Validators.email]],
      phoneCountryCode: [this.storeData && this.storeData.phoneCountryCode ? this.storeData.phoneCountryCode : '', Validators.maxLength(6)],
      phoneNumber: [this.location.phoneNumber, [Validators.maxLength(16)]],
      longitude: [this.mode === 'UPDATE' && this.location.longitude ? this.location.longitude : this.storeData.longitude],
      latitude: [this.mode === 'UPDATE' && this.location.latitude ? this.location.latitude : this.storeData.latitude],
      OPEN_TAP: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.storeId = s.id;
      this.storeAlias = s.aliasName;

      if (!this.location.allowCustomerReservation) {
        this.customerResrvationEnabled = false;
      } else {
        this.customerResrvationEnabled = true;
      }

      this.countryCode = s.address && s.address.country ? s.address.country.code : '';
      if (s && s.settings && s.settings.OPEN_TAP) {
        this.storeOpenTap = s.settings.OPEN_TAP;
      }
      if (s && s.settings && s.settings.ENABLE_STANDALONE_PAYMENT) {
        this.enableStandalonePayment = s.settings.ENABLE_STANDALONE_PAYMENT;
      }
      if (s && s.settings && s.settings.STANDALONE_PAYMENT_SOURCE) {
        this.standalonePaymentSource = s.settings.STANDALONE_PAYMENT_SOURCE;
      }
      this.locationForm.get('allowCustomerReservation').setValue(s.settings.RESERVATION_ALLOW_CUSTOMER);
      this.locationForm.get('OPEN_TAP').setValue(s.settings.OPEN_TAP);
    });
    this.locationUrl = this.protocol + '//' + this.storeData.aliasName + '.' + this.host + '/#l/' + this.location.label;


    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && s.storeRoles[+this.storeId] && s.storeRoles[+this.storeId] === 'STORE_STANDARD') {
        this.isStoreOperator = true;
      } else {
        this.isStoreOperator = false;
      }
    });

    this.store.pipe(
      select(getSelectedStoreLocation),
      takeUntil(this.destroy$)
    ).subscribe(l => {
      this.locationId = l.id;
      this.locationLabel = l.label;
    });


  }
  ngAfterContentInit() {
    if (this.showAdditionalPart) {
      if (this.mode === 'CREATE' && this.storeData && this.storeData.latitude && this.storeData.longitude) {
        this.initializeMap(this.storeData.latitude, this.storeData.longitude);
      } else if (this.location && this.location.latitude && this.location.longitude) {
        this.initializeMap(this.location.latitude, this.location.longitude);
      } else {
        this.initializeMap(-1, -1);
      }
    }

  }
  getControl(name: string) {
    return this.locationForm.get(name);
  }

  onOrderPrint() {
    this.store.dispatch(new DownloadLocationPinPdf(this.storeId, this.locationId));
  }

  setLocationURL(newLocation: any) {
    if (!this.locationForm.invalid) {
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/' + newLocation;
    } else {
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/';
    }
  }

  toggleSetting() {
    const allowCustomerReservation = this.locationForm.controls.allowCustomerReservation.value;
    const newValue = allowCustomerReservation === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    this.locationForm.controls.allowCustomerReservation.setValue(newValue);
    // Emit the updated value to the parent component or wherever needed
    this.save.emit(this.locationForm.controls.allowCustomerReservation.value);
  }


  onLocationTypeChanged(event) {
    this.locationForm.value.locationType = event.target.value;
    if (this.locationForm.value.locationType === 'LOCATION' || this.locationForm.value.locationType === 'ROOM') {
      this.showAdditionalPart = true;
      if (this.storeData && this.storeData.latitude && this.storeData.longitude) {
        this.initializeMap(this.storeData.latitude, this.storeData.longitude);
      } else {
        this.initializeMap(-1, -1);
      }
    } else {
      this.showAdditionalPart = false;
    }
    this.updateLocationFormValueAndValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newLocation = changes.location;
    if (this.locationForm && !!newLocation) {
      this.currentLocation = newLocation.currentValue.label;
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/' + this.currentLocation;
      this.storeUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/reservation';
      this.locationForm.patchValue(
        newLocation.currentValue
      );
    }
  }

  onSubmit() {
    this.locationForm.markAllAsTouched();
    this.updateLocationFormValueAndValidators();
    this.locationForm.updateValueAndValidity();
    if (!this.locationForm.valid) {
      return;
    }
    this.locationForm.value.allowCustomerReservation = this.customerResrvationEnabled;
    this.locationForm.value.label = this.locationForm.value.label.trim();
    this.locationForm.value.description = (this.locationForm.value.description) ? this.locationForm.value.description.trim() : '';
    this.locationForm.value.comment = (this.locationForm.value.comment) ? this.locationForm.value.comment.trim() : '';
    this.locationForm.value.locationType = (this.locationForm.value.locationType) ? this.locationForm.value.locationType.trim() : null;
    this.locationForm.value.externalId = (this.locationForm.value.externalId) ? this.locationForm.value.externalId.trim() : '';
    this.locationForm.value.reservationPriority = (this.locationForm.value.reservationPriority) ? this.locationForm.value.reservationPriority : '';
    this.save.emit(this.locationForm.value);
  }

  onCancel() {
    this.cancel.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  copyLocationURL() {
    navigator.clipboard.writeText(this.locationUrl.toString());
  }
  copyStoreURL() {
    navigator.clipboard.writeText(this.storeUrl.toString());
  }

  getOpenTime(openDate) {
    const currentDate: any = new Date();
    const tableOpenDate: any = new Date(openDate);
    return moment.utc(moment(currentDate, 'DD/MM/YYYY HH:mm:ss').diff(moment(tableOpenDate, 'DD/MM/YYYY HH:mm:ss'))).format('HH:mm');
  }

  getPlaceAutocomplete(event: KeyboardEvent) {
    const keyPressed = event.key;
    let options: google.maps.places.Autocomplete;

    // Observe autocomplete attribute changes made by Google Maps API
    this.autocompleteAttrObserver.observe(this.addresstext.nativeElement, {
      attributes: true,
      attributeFilter: ['autocomplete']
    });

    if (this.countryCode) {
      this.code = this.countryCode;
      if (keyPressed !== 'ArrowDown' && keyPressed !== 'ArrowUp') {
        options = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
          types: ['address'],
          componentRestrictions: { country: this.code },
          fields: ['address_components', 'geometry', 'icon', 'name']
        });
      }
    } else {
      this.code = '';
      if (keyPressed !== 'ArrowDown' && keyPressed !== 'ArrowUp') {
        options = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
          types: ['address'],
          fields: ['address_components', 'geometry', 'icon', 'name']
        });
      }
    }
    if (options) {
      google.maps.event.addListener(options, 'place_changed', () => {
        const place = options.getPlace();
        this.invokeEvent(place);
      });
    }
    if ((event.target as any).value === '') {
      this.clearAddressFields();
    }
  }

  clearAddressFields(): void {
    this.locationForm.patchValue({
      postCode: null,
      region: null,
      city: null,
      addressLine1: null,
      addressLine2: null
    });
  }

  invokeEvent(place: any) {
    google.maps.event.clearInstanceListeners(this.addresstext.nativeElement);
    if (place) {
      // this.mapReturnResult = true;
      this.changeDetector.detectChanges();
      this.setAddress = place.formatted_address;
      this.locationForm.get('addressLine1').setValue(this.addresstext.nativeElement.value, { onlySelf: true });
      this.locationForm.patchValue({
        postCode: null,
        region: null,
        city: null,
        addressLine2: null
      });
      const addressLine1: string = this.addresstext.nativeElement.value;
      // and then fill-in the corresponding field on the form.
      if (place.address_components) {
        const components: any[] = place.address_components;
        parseAddress(components, this.locationForm, addressLine1).then(() => {
          this.locationForm.controls.longitude.setValue(place.geometry.location.lng(), { onlySelf: true });
          this.locationForm.controls.latitude.setValue(place.geometry.location.lat(), { onlySelf: true });
          this.locationForm.updateValueAndValidity();
          this.initializeMap(place.geometry.location.lat(), place.geometry.location.lng());
        });
      }
    }
  }

  onPhoneNumberChange(e) {
    const phoneNumber = this.getControl('phoneNumber');
    if (!(phoneNumber && phoneNumber.touched)) {
      return;
    }
    const phoneNo = (e.target.value ? e.target.value : '').trim();
    if (phoneNo.length !== 0) {
      this.locationForm.get('phoneCountryCode').setValidators(Validators.compose([Validators.required]));
    } else {
      this.locationForm.get('phoneCountryCode').clearValidators();
    }
    this.locationForm.get('phoneCountryCode').updateValueAndValidity();
  }

  initializeMap(lat, long) {
    // if (lat && lat === -1 && long && long === -1){
    this.mapReturnResult = true;
    // }
    this.addressImageURL = 'https://maps.google.com/maps?q=,139.664123&hl=en&z=14&amp;output=embed';
    const lngLat = new google.maps.LatLng(lat, long);

    const mapOptions = {
      zoom: 13,
      center: lngLat,
      scrollwheel: false
    };

    setTimeout(() => {
      if (this.mapElement && this.mapElement.nativeElement) {
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        const marker = new google.maps.Marker({
          position: lngLat
        });
        marker.setMap(this.map);
      }
    }, 1000);
  }

  updateLocationFormValueAndValidators() {
    const addressLine1 = this.getControl('addressLine1');
    const postCode = this.getControl('postCode');
    const city = this.getControl('city');

    if (this.showAdditionalPart) {
      if (addressLine1 && postCode && city) {
        addressLine1.setValidators([
          Validators.minLength(1),
          Validators.maxLength(128), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ]);
        // addressLine1.patchValue(addressLine1.value, {onlySelf: true, emitEvent: true});
        // addressLine1.clearValidators();
        addressLine1.updateValueAndValidity();
        postCode.setValidators([Validators.minLength(1), Validators.maxLength(16)]);
        // postCode.clearValidators();
        // postCode.patchValue(postCode.value,{onlySelf: true, emitEvent: true});
        postCode.updateValueAndValidity();
        city.setValidators([
          Validators.minLength(1),
          Validators.maxLength(64), ,
          Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
        ]);
        // city.patchValue(city.value, {onlySelf: true, emitEvent: true});
        city.updateValueAndValidity();
      } else {
        if (addressLine1 && postCode && city) {
          addressLine1.setValidators([
            Validators.minLength(1),
            Validators.maxLength(128), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ]);
          // addressLine1.patchValue(null);
          // addressLine1.patchValue(addressLine1.value, {onlySelf: true, emitEvent: true});
          addressLine1.updateValueAndValidity();
          postCode.setValidators([Validators.minLength(1), Validators.maxLength(16)]);
          // postCode.patchValue(null);
          // postCode.patchValue(postCode.value, {onlySelf: true, emitEvent: true});
          postCode.updateValueAndValidity();
          city.setValidators([
            Validators.minLength(1),
            Validators.maxLength(64), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ]);
          // city.patchValue(null);
          // city.patchValue(city.value, {onlySelf: true, emitEvent: true});
          city.updateValueAndValidity();
        }
      }
    }
  }

  copyTitleURL(elementId: string) {
    let text = document.getElementById(elementId)?.innerHTML;
    if (text) {
      navigator.clipboard.writeText(text);
    }
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.addresstext && this.addresstext.nativeElement && google) {
      google.maps.event.clearInstanceListeners(this.addresstext.nativeElement);
    }
  }
}
