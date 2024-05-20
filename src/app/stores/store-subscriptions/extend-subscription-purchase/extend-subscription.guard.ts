import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class ExtendSubscriptionGuard {
  constructor(private stores: Store<any>) { }

  canActivate() {
    return this.stores.pipe(select(getLoggedInUser), filter(loggedInUser => +loggedInUser.id !== -1),
      map(s => s.superAdmin || s.countryPartner));
  }

}
