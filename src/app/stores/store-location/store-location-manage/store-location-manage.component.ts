import { getSelectedStore } from '../../+state/stores.selectors';
import { Router, ActivatedRoute } from '@angular/router';
import { getSelectedStoreLocation, getSelectedStoreLocationStatus } from '../+state/store-location.selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ClientStoreLocationRequest } from '../store-location';
import { UpdateStoreLocation, DeleteStoreLocation, CreateStoreLocation } from '../+state/store-location.actions';
import { ClientStoreRequest } from '../../stores';

@Component({
  selector: 'app-store-location-manage',
  templateUrl: './store-location-manage.component.html',
  styleUrls: ['./store-location-manage.component.scss']
})
export class StoreLocationManageComponent implements OnInit, OnDestroy {

  storeId$: Observable<number>;
  locationId$: Observable<number>;
  locationLabel$: Observable<string>;
  locationRequest$: Observable<ClientStoreLocationRequest>;
  locationStatus: string;
  destroyed$ = new Subject<void>();
  locationId: any;
  newLocation: ClientStoreLocationRequest = { label: '' };
  store$: Observable<ClientStoreRequest>;

  constructor(private store: Store<any>, private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {

    const params = this.activeRoute.params as {[key: string]: any};
    this.locationId = params._value.locationId;

    this.storeId$ = this.store.pipe(
      select(getSelectedStore),
      filter(s => s.id > 0),
      map(s => s.id)
    );

    this.locationId$ = this.store.pipe(
      select(getSelectedStoreLocation),
      filter(l => !!l),
      map(l => l.id)
    );

    this.locationLabel$ = this.store.pipe(
      select(getSelectedStoreLocation),
      filter(l => !!l),
      map(l => l.label)
    );

    this.locationRequest$ = this.store.pipe(
      select(getSelectedStoreLocation),
      map(l => ({ ...l,
        id: l.id, label: l.label.toUpperCase(), comment: l.comment, description: l.description, locationType: l.locationType,
        openTap: l.openTap, customerPinCode: l.customerPinCode, openedAt: l.openedAt, status: l.status, externalId: l.externalId,
        tapId: l.tapId
      }))
    );

    this.store
      .pipe(
        select(getSelectedStoreLocationStatus),
        takeUntil(this.destroyed$),
      )
      .subscribe(s => {
        this.locationStatus = s;
      });
    this.store$ = this.store.pipe(
      select(getSelectedStore),
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
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  update(location: ClientStoreLocationRequest) {
    this.store.dispatch(new UpdateStoreLocation(location));
  }

  create(location: ClientStoreLocationRequest) {
    this.store.dispatch(new CreateStoreLocation([location]));
  }

  cancel() {
    const params = this.activeRoute.params as {[key: string]: any};
    this.router.navigate(['/manager/stores', params._value.id, 'locations']);
  }

  delete() {
    const params = this.activeRoute.params as {[key: string]: any};
    this.store.dispatch(new DeleteStoreLocation(params._value.locationId));
  }

}
