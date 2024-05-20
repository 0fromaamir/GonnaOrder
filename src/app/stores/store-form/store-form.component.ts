/// <reference types="@types/googlemaps" />

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from 'src/app/account/account.service';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { parseAddress } from 'src/app/shared/map-address.helper';
import {
  ValidateAliasAvailability,
  ValidateAliasAvailabilityReset
} from '../+state/stores.actions';
import { getAliasAvailabilityState, getAliasAvailabilityStatus } from '../+state/stores.selectors';
import { ClientStoreRequest, TimeZone } from '../stores';
import { ReferenceDataService } from './../../api/reference-data.service';
import { Country } from './../../api/types/Country';
import { Language } from './../../api/types/Language';
declare var google: any;

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.component.html',
  styleUrls: ['./store-form.component.scss']
})
export class StoreFormComponent implements OnInit, OnDestroy, OnChanges {

  @Input() mode = '';
  @Input() store$: Observable<ClientStoreRequest>;
  @Output() submitEvent = new EventEmitter<ClientStoreRequest>();
  @Input() imageContainer: boolean;
  @Input() storeImage: string;
  @Input() storeLogo: string;
  @Output() imageUpload: EventEmitter<File> = new EventEmitter<File>();
  @Output() logoUpload: EventEmitter<File> = new EventEmitter<File>();
  @Output() removePic = new EventEmitter<boolean>();
  @ViewChild('addresstext') addresstext: any;
  map: google.maps.Map;
  @ViewChild('mapWrapper') mapElement: ElementRef;

  componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };
  adressType = 'address';
  setAddress: string;

  mapReturnResult: boolean;

  autocompleteInput: string;
  queryWait: boolean;
  storeForm: FormGroup;
  countriesList: Country[] = [];
  languagesList: Language[] = [];
  timeZones: TimeZone[] = [];
  showNotSubscribedMsg = false;
  storeId: number;
  aliasAvailabilityStatus: string;
  aliasAvailabilityLoadingStatus: string;
  storeData: ClientStoreRequest;
  addressImageURL: string;
  code: string;
  nameInvalid = true;

  private destroy$ = new Subject();

  // Google Maps API changes autocomplete value to 'off' after the address is selected
  // Chrome has a bug where it doesn't respect autocomplete='off' on the input element
  // This observer will set the autocomplete attribute to 'none' if the address is filled
  private autocompleteAttrObserver = new MutationObserver(() => {
    this.autocompleteAttrObserver.disconnect();
    this.addresstext.nativeElement.setAttribute('autocomplete', this.getControl('addressLine1').value ? 'none' : 'address-line1');
  });

  constructor(private fb: FormBuilder, private referenceDataService: ReferenceDataService, private accountService: AccountService,
              private storeState: Store<any>, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.store$
      .pipe(takeUntil(this.destroy$))
      .subscribe(storeData => {
        this.storeData = storeData;
        this.storeForm = this.fb.group({
          name: [
            storeData.name,
            Validators.compose([
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(50), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$'),
              CustomValidators.containsUrl
            ])
          ],
          description: [
            storeData.description,
            Validators.compose([
              Validators.minLength(10),
              Validators.maxLength(150), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
            ])
          ],
          aliasName: [
            storeData.aliasName,
            Validators.compose([
              Validators.required,
              Validators.maxLength(36),
              Validators.minLength(6),
              Validators.pattern('^[a-zA-Z0-9_-]*[a-zA-Z_-]+[a-zA-Z0-9_-]*$')
            ])
          ],
          externalId: [storeData.externalId],
          longitude: [storeData.longitude],
          latitude: [storeData.latitude],
          countryId: [storeData.countryId, Validators.required],
          languageId: [storeData.languageId, Validators.required],
          addressLine1: [
            storeData.addressLine1,
            Validators.compose([
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(128), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
            ])
          ],
          addressLine2: [
            storeData.addressLine2,
            Validators.compose([
              Validators.minLength(1),
              Validators.maxLength(128), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
            ])
          ],
          postCode: [storeData.postCode, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(16)])],
          region: [
            storeData.region,
            Validators.compose([
              Validators.minLength(1),
              Validators.maxLength(64), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
            ])
          ],
          city: [
            storeData.city,
            Validators.compose([
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(64), ,
              Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
            ])
          ],
          phoneCountryCode: [storeData.phoneCountryCode, Validators.maxLength(6)],
          phoneNumber: [storeData.phoneNumber, [Validators.maxLength(16)]],
          timeZone: [storeData.timeZone]
        });

        this.showNotSubscribedMsg = false;
        this.storeId = storeData.id;
        if (storeData.subscription && storeData.subscription.status === 'TRIAL') {
          this.showNotSubscribedMsg = true;
        }
        if (storeData.countryId > 0) {
          if (this.countriesList && this.countriesList.find(x => +x.id === +storeData.countryId)) {
            this.code = this.countriesList.find(x => +x.id === +storeData.countryId)
                        ? this.countriesList.find(x => +x.id === +storeData.countryId).code : '';
          }
        }
        if (this.storeData && this.storeData.latitude && this.storeData.longitude) {
          this.initializeMap(this.storeData.latitude, this.storeData.longitude);
        }
      });


    forkJoin([this.referenceDataService.getCountries(), this.referenceDataService.getLanguages()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.countriesList = results[0].data;
        this.languagesList = results[1].data;
        this.onCountryChanged(true);
      });

    combineLatest([
      this.storeState.pipe(select(getAliasAvailabilityState)),
      this.storeState.pipe(select(getAliasAvailabilityStatus))
    ]).pipe(
      takeUntil(this.destroy$)
    )
      .subscribe(state => {
        if (state && state[0]) {
          this.aliasAvailabilityLoadingStatus = state[1];
          this.aliasAvailabilityStatus = state[0].status;
          // Resetting the state
          this.storeState.dispatch(new ValidateAliasAvailabilityReset());
        }
      });

    combineLatest([
      this.accountService.get(),
      this.storeState.pipe(select(getLoggedInUser))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state[0] && state[1]) {
        if (!this.storeData.name && state[0]) {
          if (state[0].country) {
            this.storeForm.get('countryId').setValue(state[0].country.id.toString(), { onlySelf: true });
            this.onCountryChanged(false);

          }
          if (state[1] && !state[1].affiliate) {
            this.storeForm.get('phoneNumber').setValue(state[0].phoneNumber, { onlySelf: true });
          }

        } else {
          if (state[1] && !state[1].superAdmin) {
            this.storeForm.get('countryId').disable();
          }
        }
      }
    });


  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeMap(lat, long) {
    this.addressImageURL = 'https://maps.google.com/maps?q=,139.664123&hl=en&z=14&amp;output=embed';
    const lngLat = new google.maps.LatLng(lat, long);

    const mapOptions = {
      zoom: 13,
      center: lngLat,
      scrollwheel: false
    };

    setTimeout(() => {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      const marker = new google.maps.Marker({
        position: lngLat
      });
      marker.setMap(this.map);
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newStore = changes.store$;
    if (this.storeForm && !!newStore) {
      this.storeForm.patchValue(
        newStore.currentValue
      );
    }
  }

  getControl(name: string) {
    return this.storeForm.get(name);
  }

  onNameChange(event) {
    this.nameInvalid = true;
    if (!event || !event.target || !event.target.value) {
      this.storeForm.get('aliasName').setValue('');
      return;
    }
    let givenName = event.target.value.toString();
    const regExStr = /[^a-zA-Z0-9]/gi;
    const regExStrChk = /^[a-z\d]+$/i;
    if (!regExStrChk.test(givenName)) {
      givenName = givenName.replace(regExStr, '');
    }
    givenName = !givenName ? 's' : givenName;
    if ((/\d/).test(givenName.charAt(0))) {
      givenName = givenName.replace(givenName, 's' + givenName);
    }
    if (givenName.length < 6) {
      givenName = givenName + '-' + Math.floor(100000 + Math.random() * 900000);
    }
    this.storeForm.get('aliasName').setValue(givenName.toLowerCase());
    if (this.storeForm.get('name').valid) {
      this.validateAliasAvailability();
      this.nameInvalid = false;
    }
  }
  onCountryChanged(isManuallyCall: boolean) {
    this.timeZones = [];
    const countryId = this.getControl('countryId').value;
    this.storeForm.patchValue({ timeZone: null });
    if (!isManuallyCall) {
      this.clearAddressFields();
    }
    if (countryId && this.countriesList && this.languagesList) {
      google.maps.event.clearInstanceListeners(this.addresstext.nativeElement);
      const c = this.countriesList.find(country => +country.id === +countryId);
      const l = this.languagesList.find(lang => lang.locale === c.defaultLocale);
      this.code = this.countriesList.find(country => +country.id === +countryId)
                  ? this.countriesList.find(country => +country.id === +countryId).code : '';
      if (c && c.code) {
        this.referenceDataService.getTimeZones(c.code.toUpperCase())
          .pipe(takeUntil(this.destroy$))
          .subscribe(results => {
            this.timeZones = results.data;
            if (this.timeZones != null && this.timeZones.length === 1) {
              this.storeForm.patchValue({ timeZone: this.timeZones[0].zoneId });
            } else if ((this.timeZones != null && this.timeZones.length > 1 && this.storeData.timeZone == null) ||
              !isManuallyCall) {
              const t = this.timeZones.find(z => z.zoneId === c.defaultTimeZone);
              if (t != null) {
                this.storeForm.patchValue({ timeZone: c.defaultTimeZone });
              }
            } else if (this.timeZones != null && this.timeZones.length > 1 && this.storeData.timeZone != null) {
              const t = this.timeZones.find(z => z.zoneId === this.storeData.timeZone);
              if (t != null) {
                this.storeForm.patchValue({ timeZone: this.storeData.timeZone });
              }
            }
          });

      }
      if (this.storeData.languageId == null && l) {
        this.storeForm.get('languageId').setValue(l.id, { onlySelf: true });
      }
      if (c) {
        this.storeForm.get('phoneCountryCode').setValue(c.phoneCode, { onlySelf: true });
      }
    } else {
      this.storeForm.get('phoneCountryCode').setValue('', { onlySelf: true });
    }
  }

  onPhoneNumberChange(e) {
    const phoneNo = (e.target.value ? e.target.value : '').trim();
    if (phoneNo.length !== 0) {
      this.storeForm.get('phoneCountryCode').setValidators(Validators.compose([Validators.required]));
    } else {
      this.storeForm.get('phoneCountryCode').clearValidators();
    }
    this.storeForm.get('phoneCountryCode').updateValueAndValidity();
  }

  onSubmit() {
    this.storeForm.markAllAsTouched();
    if (this.storeForm.valid) {
    this.submitEvent.emit(this.storeForm.getRawValue());
  } else {
    this.storeForm.get('name').markAsTouched();
  }

}
  onStoreImageUpload(file: File) {
    this.imageUpload.emit(file);
  }
  onStoreLogoUpload(file: File) {
    this.logoUpload.emit(file);
  }

  onStoreRemovePics(type: any) {
    this.removePic.emit(type);
  }

  validateAliasAvailability() {
    if (this.storeForm.get('aliasName').valid && (this.storeData.aliasName !== this.storeForm.get('aliasName').value)) {
      this.storeState.dispatch(new ValidateAliasAvailability(this.storeId, this.storeForm.get('aliasName').value));
    }
  }

  getPlaceAutocomplete(event: KeyboardEvent) {

    // Observe autocomplete attribute changes made by Google Maps API
    this.autocompleteAttrObserver.observe(this.addresstext.nativeElement, {
      attributes: true,
      attributeFilter: ['autocomplete']
    });

    const keyPressed = event.key;
    if (this.storeForm.controls.countryId.value
        && this.storeForm.controls.countryId.value > 0
        && this.countriesList.find(x => +x.id === +this.storeForm.controls.countryId.value)) {
      this.code = this.countriesList.find(x => +x.id === +this.storeForm.controls.countryId.value).code;
    } else {
      this.code = '';
    }
    let options;
    if (keyPressed !== 'ArrowDown' && keyPressed !== 'ArrowUp') {
      options = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
        types: ['address'],
        componentRestrictions: { country: this.code },
        fields: ['address_components', 'geometry', 'icon', 'name']
      });
      if (this.code === '') {
        options = new google.maps.places.Autocomplete(this.addresstext.nativeElement, {
          types: ['address'],
          fields: ['address_components', 'geometry', 'icon', 'name']
        });
      }
    }

    if (options) {
      google.maps.event.addListener(options, 'place_changed', () => {
        const place = options.getPlace();
        for (const i in place.address_components) {
          if (place.address_components[i].types.indexOf('postal_code') > -1) {
            place.postal_code = place.address_components[i].short_name;
          }
        }
        this.invokeEvent(place);
      });
    }

    if ((event.target as any).value === '') {
      this.clearAddressFields();
    }
  }

  clearAddressFields(): void {
    this.storeForm.patchValue({
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
      this.mapReturnResult = true;
      this.changeDetector.detectChanges();
      this.setAddress = place.formatted_address;
      this.storeForm.patchValue({
        postCode: null,
        region: null,
        city: null,
        addressLine1: this.addresstext.nativeElement.value
      });
      const addressLine1: string = this.addresstext.nativeElement.value;
      // and then fill-in the corresponding field on the form.
      if (place.address_components) {
        const components: any[] = place.address_components;
        parseAddress(components, this.storeForm, addressLine1).then(() => {
          this.storeForm.controls.longitude.setValue(place.geometry.location.lng());
          this.storeForm.controls.latitude.setValue(place.geometry.location.lat());
          this.storeForm.updateValueAndValidity();
          this.initializeMap(place.geometry.location.lat(), place.geometry.location.lng());
        });
        const countries: any[] = components.filter(a => a.types.includes('country'));
        if (countries && countries.length > 0 && !this.code) {
          if (this.countriesList.find(x => x.code === countries[0].short_name)) {
            this.storeForm.get('countryId')
              .setValue(this.countriesList.find(x => x.code === countries[0].short_name).id.toString());
            this.code = countries[0].short_name;
            this.onCountryChanged(false);
          }
        }
      }
    }
  }
}
