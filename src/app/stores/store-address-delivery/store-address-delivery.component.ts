/// <reference types="@types/googlemaps" />
import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { PartialUpdateStore, UpdateStoreSettings } from '../+state/stores.actions';
import { getSelectedStore, getStoreZones, getStoreZoneStatus } from '../+state/stores.selectors';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClientStoreRequest, StoreZone, TimeZone } from '../stores';
import { Country } from 'src/app/api/types/Country';
import { Language } from 'src/app/api/types/Language';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { parseAddress } from 'src/app/shared/map-address.helper';
declare var google: any;

@Component({
  selector: 'app-store-address-delivery',
  templateUrl: './store-address-delivery.component.html',
  styleUrls: ['./store-address-delivery.component.scss']
})
export class StoreAddressDeliveryComponent implements OnInit, OnDestroy {
  addressDeliveryForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  storeId: any;
  paramsSubscription: any;
  enableRestriction: boolean;
  zones$: Observable<any>;
  helpUrl: string;
  @Input() mode = '';
  storeUpdate$: Observable<ClientStoreRequest>;
  @ViewChild('createzone') createzone: TemplateRef<any>;
  map: google.maps.Map;
  @ViewChild('addresstext') addresstext: any;
  @ViewChild('mapWrapper') mapElement: ElementRef;
  @Input() store$: Observable<ClientStoreRequest>;
  timeZones: TimeZone[] = [];
  addressImageURL: string;
  countriesList: Country[] = [];
  languagesList: Language[] = [];
  code: string;
  storeData: ClientStoreRequest;
  private destroy$ = new Subject();
  mapReturnResult: boolean;
  setAddress: string;
  lngLat: google.maps.LatLng;
  zoneData: any = [];
  constructor(private router: Router, private changeDetector: ChangeDetectorRef, private referenceDataService: ReferenceDataService, private fb: FormBuilder, private store: Store<StoresState>, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.helpUrl = 'delieveryZoneRestriction';
    this.zones$ = this.store.pipe(select(getStoreZones));
    this.zones$.subscribe(data => {
      if (data?.zones) {
        this.zoneData = data?.zones
      }
    })
    this.addressDeliveryForm = this.fb.group({
      orderMinAmountDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderFeeDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderAmountFreeDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      DELIVERY_ADDRESS_AUTOCOMPLETE: [''],
      FLOOR_NUMBER_VISIBILITY: [''],
      setup_zone: [''],
      DELIVERY_ZONE_RESTRICTION: [''],
      DELIVERY_FEE_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])]
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeId = s.id;
      if (s && s.settings && Object.keys(s.settings).length > 0) {
        this.addressDeliveryForm.get('orderMinAmountDelivery').setValue(s.orderMinAmountDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('orderFeeDelivery').setValue(s.orderFeeDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('orderAmountFreeDelivery').setValue(s.orderAmountFreeDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_ADDRESS_AUTOCOMPLETE').setValue(s.settings.DELIVERY_ADDRESS_AUTOCOMPLETE,
          { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_ZONE_RESTRICTION').setValue(s.settings.DELIVERY_ZONE_RESTRICTION, { onlySelf: true });
        this.addressDeliveryForm.get('FLOOR_NUMBER_VISIBILITY').setValue(s.settings.FLOOR_NUMBER_VISIBILITY, { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_FEE_EXTERNAL_ID').setValue(s.settings.DELIVERY_FEE_EXTERNAL_ID, { onlySelf: true });
      }
    });

    this.storeUpdate$ = this.store.pipe(
      select(getSelectedStore),
      tap(s => this.storeId = s.id),
      map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        aliasName: s.aliasName,
        externalId: s.externalId,
        longitude: s.coordinates.longitude,
        latitude: s.coordinates.latitude,
        countryId: s.address.country.id,
        languageId: s.language.id,
        addressLine1: s.address.addressLine1,
        addressLine2: s.address.addressLine2,
        postCode: s.address.postCode,
        region: s.address.region,
        city: s.address.city,
        phoneCountryCode: s.address.country.phoneCode,
        phoneNumber: s.phoneNumber,
        timeZone: s.timeZone,
        subscription: s.subscription
      })
      )
    );

    this.storeUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(storeData => {
        this.storeData = storeData;
        if (this.storeData && this.storeData.latitude && this.storeData.longitude) {
          this.initializeMap(this.storeData.latitude, this.storeData.longitude);
        }
      });

    this.store.pipe(
      select(getStoreZoneStatus),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s) {
        this.enableRestriction = s.enableRestriction;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  openCreateZoneDialog(): void {
    const dialogRef = this.dialog.open(this.createzone, {
      width: '30%'
    });

  }

  getPlaceAutocomplete(event: KeyboardEvent) {
    const keyPressed = event.key;
    if (this.addressDeliveryForm.controls.countryId.value > 0
      && this.countriesList.find(x => +x.id === +this.addressDeliveryForm.controls.countryId.value)) {
      this.code = this.countriesList.find(x => +x.id === +this.addressDeliveryForm.controls.countryId.value).code;
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


      setTimeout(() => {
        this.drawOnMap(lat, long)
      }, 100);

    }, 500);

  }

  drawOnMap(lat, long) {
    if (this.zoneData?.length) {
      this.zoneData.forEach((zoneData) => {
        if (zoneData.type === "POLYGON") {
          const polygons = [];
          for (const val of zoneData.polygon) {
            const arrayofcoordinates = {
              lng: val.longitude,
              lat: val.latitude
            };
            polygons.push(arrayofcoordinates);
          }
          const polygonmap = new google.maps.Polygon({
            paths: polygons,
          });
          polygonmap.setMap(this.map);
        } else {
          new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00FFFFFF',
            fillOpacity: 0,
            map: this.map,
            center: new google.maps.LatLng(lat, long),
            radius: zoneData.maxRadius * 1000

          });
          new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00FFFFFF',
            fillOpacity: 0,
            map: this.map,
            center: new google.maps.LatLng(lat, long),
            radius: zoneData.minRadius * 1000

          });
        }
      })

    }
  }

  invokeEvent(place: any) {
    google.maps.event.clearInstanceListeners(this.addresstext.nativeElement);
    if (place) {
      this.mapReturnResult = true;
      this.changeDetector.detectChanges();
      this.setAddress = place.formatted_address;
      this.addressDeliveryForm.patchValue({
        postCode: null,
        region: null,
        city: null,
        addressLine1: this.addresstext.nativeElement.value
      });
      const addressLine1: string = this.addresstext.nativeElement.value;
      if (place.address_components) {
        const components: any[] = place.address_components;
        parseAddress(components, this.addressDeliveryForm, addressLine1).then(() => {
          this.addressDeliveryForm.controls.longitude.setValue(place.geometry.location.lng());
          this.addressDeliveryForm.controls.latitude.setValue(place.geometry.location.lat());
          this.addressDeliveryForm.updateValueAndValidity();
          this.initializeMap(place.geometry.location.lat(), place.geometry.location.lng());
        });
        const countries: any[] = components.filter(a => a.types.includes('country'));
        if (countries && countries.length > 0 && !this.code) {
          if (this.countriesList.find(x => x.code === countries[0].short_name)) {
            this.addressDeliveryForm.get('countryId')
              .setValue(this.countriesList.find(x => x.code === countries[0].short_name).id.toString());
            this.code = countries[0].short_name;
          }
        }
      }
    }
  }

  onPartialSubmit() {
    if (this.addressDeliveryForm.valid) {
      const {
        DELIVERY_ADDRESS_AUTOCOMPLETE,
        DELIVERY_ZONE_RESTRICTION,
        setup_zone,
        FLOOR_NUMBER_VISIBILITY,
        DELIVERY_FEE_EXTERNAL_ID,
        ...priceFormValues
      } = this.addressDeliveryForm.getRawValue();
      this.store.dispatch(new PartialUpdateStore(priceFormValues));
    }
  }

  getControl(name: string) {
    return this.addressDeliveryForm.get(name);
  }

  gotoZone(id = 0, type) {
    // tslint:disable-next-line
    this.router.navigate([`/manager/stores/${this.storeId}/settings/zoneview/${id}`], { queryParams: { type } });
  }
  gotoSetupZone() {
    if (this.getControl('setup_zone').value) {
      this.router.navigate(
        [`/manager/stores/${this.storeId}/settings/zone/0`],
        { queryParams: { type: this.getControl('setup_zone').value } }
      );
    }
    this.dialog.closeAll();
  }
  onSubmit() {
    if (this.getControl('DELIVERY_FEE_EXTERNAL_ID').invalid || this.getControl('DELIVERY_FEE_EXTERNAL_ID').errors) {
      return;
    }
    const {
      orderMinAmountDelivery,
      orderFeeDelivery,
      orderAmountFreeDelivery,
      setup_zone,
      ...addressDeliveryValues
    } = this.addressDeliveryForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(addressDeliveryValues));
  }

}
