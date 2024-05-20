import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadTenantUsers } from './+state/platform.actions';

@Injectable({
  providedIn: 'root'
})
export class TenantUserViewGuard {
  constructor(private stores: Store<any>) { }
  canActivate(route: ActivatedRouteSnapshot) {
    const tenantCode = route.params.tenantCode;
    this.stores.dispatch(new LoadTenantUsers(tenantCode));
    return true;
  }
}
