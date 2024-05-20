import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadTenants } from './+state/platform.actions';

@Injectable({
  providedIn: 'root'
})
export class PlatformGuard {
  constructor(private stores: Store<any>) { }
  canActivate(route: ActivatedRouteSnapshot) {
    this.stores.dispatch(new LoadTenants({ page: 0, size: 20 }));
    return true;
  }
}
