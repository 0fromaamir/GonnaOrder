import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadSelectedTenant, LoadTenants } from './+state/platform.actions';

@Injectable({
  providedIn: 'root'
})
export class TenantViewGuard {
  constructor(private stores: Store<any>) { }
  canActivate(route: ActivatedRouteSnapshot) {
    const tenantCode = route.params.tenantCode;
    if(tenantCode !== 'createTenant'){
      this.stores.dispatch(new LoadSelectedTenant(tenantCode));
    }
    return true;
  }
}
