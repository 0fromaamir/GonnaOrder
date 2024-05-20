import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from './+state/stores.reducer';
import { getSelectedStore, getStoresList } from './+state/stores.selectors';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from '../auth/+state/auth.selectors';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StoresRelationGuard {

    constructor(private store: Store<StoresState>, private router: Router) {}

    canActivate() {
      return this.store.pipe(
        select(getSelectedStore),
        map(selectedStore => {
          if ( selectedStore.relation && ((selectedStore.relation.parentStore && selectedStore.relation.parentStore.storeId > 0)
           ||  (selectedStore.relation.childStores && selectedStore.relation.childStores.length > 0)) ) {
            this.router.navigate(['/manager/stores/' +  selectedStore.id + '/settings/multi-store/relation-tree']);
            return false;
           }
           else {
            //added this since the redirectto and canActivate cannot be used together
            this.router.navigate(['/manager/stores/' +  selectedStore.id + '/settings/multi-store/parentStorelist']);
            return true;
          }
        })
      );
    }
}
