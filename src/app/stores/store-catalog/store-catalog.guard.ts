import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadCatalog, LoadStation } from './+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreCatalogGuard {
    constructor(private stores: Store<any>) {}

    canActivate(route: ActivatedRouteSnapshot) {
      const id = route.params.id;
      this.stores.dispatch(new LoadCatalog(id));
      this.stores.dispatch(new LoadStation(id));
      return true;
    }
}
