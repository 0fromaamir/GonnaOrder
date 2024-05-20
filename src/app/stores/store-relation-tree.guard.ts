import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getSelectedStore } from './+state/stores.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreRelationTreeGuard {
  constructor(private store: Store<any>, private router: Router) { }

  canActivate() {
    return this.store.pipe(
      select(getSelectedStore),
      map(selectedStore => {
        if ( selectedStore.relation && ((selectedStore.relation.parentStore && selectedStore.relation.parentStore.storeId > 0)
         ||  (selectedStore.relation.childStores && selectedStore.relation.childStores.length > 0)) ) {
          return true;
         }
         else {
          this.router.navigate(['/manager/stores/' +  selectedStore.id + '/settings/multi-store/parentStorelist']);
          return false;
        }
      })
    );
  }
}
